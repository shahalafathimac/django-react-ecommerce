from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class SafeAPIView(APIView):
    default_error_message = "Something went wrong."

    def handle_exception(self, exc):
        response = super().handle_exception(exc)

        if response is None:
            return Response(
                {"error": "Internal server error. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response.data = {"error": self._get_error_message(response.data)}
        return response

    def validation_error(self, serializer, fallback_message="Please check your input and try again."):
        return Response(
            {"error": self._get_error_message(serializer.errors, fallback_message)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def _get_error_message(self, data, fallback_message=None):
        fallback_message = fallback_message or self.default_error_message

        if isinstance(data, dict):
            if "error" in data:
                return str(data["error"])
            if "detail" in data:
                return str(data["detail"])

            first_value = next(iter(data.values()), fallback_message)
            if isinstance(first_value, list) and first_value:
                return str(first_value[0])
            if isinstance(first_value, dict):
                return self._get_error_message(first_value, fallback_message)
            return str(first_value)

        if isinstance(data, list) and data:
            first_value = data[0]
            if isinstance(first_value, (dict, list)):
                return self._get_error_message(first_value, fallback_message)
            return str(first_value)

        if data:
            return str(data)

        return fallback_message

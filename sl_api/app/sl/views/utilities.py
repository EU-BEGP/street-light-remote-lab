import json
from datetime import datetime, timedelta


def handle_grid_param(self, grid_param, queryset):
    # Return always a list so the serializer works correctly
    try:
        if grid_param == "last":
            queryset = [queryset.last()]
        elif grid_param == "first":
            queryset = [queryset.first()]
        else:
            grid_param = int(grid_param)
            if grid_param > 0 and grid_param <= len(queryset):
                queryset = [queryset[grid_param - 1]]
            else:
                queryset = []

        return queryset, None

    except Exception as e:
        error_message = json.loads(json.dumps({"error": str(e)}))
        return None, error_message


def handle_date_params(self, start_date_param, end_date_param, queryset):
    try:
        date_format = "%Y-%m-%d"

        # Format dates
        start_date_formatted = datetime.strptime(start_date_param, date_format).date()
        end_date_formatted = (
            datetime.strptime(end_date_param, date_format).date()
            if end_date_param is not None
            else (datetime.now() + timedelta(days=1)).date()
        )

        # Get range
        queryset = queryset.filter(
            created_at__range=[start_date_formatted, end_date_formatted]
        )
        return queryset, None

    except Exception as e:
        error_message = json.loads(json.dumps({"error": str(e)}))
        return None, error_message

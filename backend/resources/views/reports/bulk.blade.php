<!DOCTYPE html>
<html>
<head>
    <title>Bulk Project Report</title>
    <style>
        body { font-family: sans-serif; }
        table { border-collapse: collapse; width: 100%; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        th { background-color: #f0f0f0; }
    </style>
</head>
<body>
    <h1>Bulk Project Report</h1>
    <table>
        <thead>
            <tr>
                <th>Title</th>
                <th>Student</th>
                <th>Group Members</th>
                <th>Status</th>
                <th>Last Submission</th>
                <th>Advisor Marks</th>
                <th>Examiner Marks</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projects as $p)
                <tr>
                    <td>{{ $p['title'] }}</td>
                    <td>{{ $p['student_name'] }}</td>
                    <td>{{ $p['group_members'] }}</td>
                    <td>{{ $p['status'] }}</td>
                    <td>{{ $p['last_submission'] }}</td>
                    <td>{{ $p['advisor_marks'] }}</td>
                    <td>{{ $p['examiner_marks'] }}</td>
                    <td>{{ $p['total_marks'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
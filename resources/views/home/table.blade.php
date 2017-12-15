<table>
    <tr>
        <th>ID</th>
        <th>Data</th>
        <th>Temperatura</th>
        <th>Wilgotność powietrza</th>
        <th>Wilgotność gleby</th>
        <th>Poziom wody</th>
    </tr>
    @foreach($measures as $measure)
    <tr>
        <td>{{ $measure->id }}</td>
        <td>{{ $measure->temp }}</td>
        <td>{{ $measure->hum }}</td>
        <td>{{ $measure->humearth }}</td>
        <td>{{ $measure->water_level }}</td>
        <td>{{ $measure->date }}</td>
    </tr>
    @endforeach

</table>
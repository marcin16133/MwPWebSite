<table class="table table-stripped">
    <tr>
        <th>Data</th>
        <th>Temperatura [℃]</th>
        <th>Wilgotność powietrza [%]</th>
        <th>Wilgotność gleby [%]</th>
        <th>Poziom wody [%]</th>
    </tr>
    @foreach($measures as $measure)
    <tr>
        <td>{{ $measure->date }}</td>
        <td>{{ $measure->temp }}</td>
        <td>{{ $measure->hum }}</td>
        <td>{{ $measure->humearth }}</td>
        <td>{{ $measure->water_level }}</td>
    </tr>
    @endforeach

</table>
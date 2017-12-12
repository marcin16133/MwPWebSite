@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
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


            {{ $measures->links() }}


            <div id="temps_div"></div>
            @linechart('Temps', 'temps_div')


        </div>
    </div>
</div>
@endsection


@section('js')
    <script src="{{ asset('js/lava.js') }}"></script>
    <script type="text/javascript">



    function setData(){
        $.get('/measures', function(data){
            lava.loadData('Temps', data, function (chart) {
                console.log("sadasd");
                console.log(chart);
            });
        });
    }
    setInterval(setData, 1000);
    </script>

@endsection

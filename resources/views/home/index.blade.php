@extends('layouts.app')

@section('content')
<div id="page" class="fluid-container">
    <div class="row">
        <div class="col-xs-4">
            <div id="temps_div" class="plot"></div>
            @linechart('Temps', 'temps_div')
        </div>

        <div class="col-xs-4">
            <div id="hum_div" class="plot"></div>
            @linechart('Hum', 'hum_div')
        </div>    
    </div>

    <div class="row">
        <div class="col-xs-4">
            <div id="humearth_div" class="plot"></div>
            @linechart('HumEarth', 'humearth_div')
        </div>   
    </div>


    <div class="data">
        <div id="table">
            @include('home.table')
        </div> 
    </div>

</div>
@endsection


@section('js')
    <script src="{{ asset('js/lava.js') }}"></script>
    <script type="text/javascript">
        function changeWaterLevel(level) {
            console.log(level);
          var a;
          a = document.getElementById("water-level");

          switch(level){
            case 0:
                a.innerHTML = "&#xf244;";
                break;
            case 1:
                a.innerHTML = "&#xf243;";
                break;
            case 2:
                a.innerHTML = "&#xf242;";
                break;
            case 3:
                a.innerHTML = "&#xf241;";
                break;
            case 4:
                a.innerHTML = "&#xf240;";
                break;
            default:
                a.innerHTML = "&#xf244;";
          }
        }

        changeWaterLevel(parseInt({{ $measures[0]->water_level / 20 }}));


        function setConnection(connection) {
            if (connection){
                $('#wifi').css('color','green');
            } else {
                $('#wifi').css('color','red');
            }
        }

        setConnection({{ $connection }});

        function setData(){
            $.get('/measures', function(data){
                lava.loadData('Temps', data['temperatures'], function (chart) {
                });
                lava.loadData('Temps', data['hum'], function (chart) {
                });
                lava.loadData('Temps', data['humearth'], function (chart) {
                });
                changeWaterLevel(parseInt(data['water_level'] / 20));
                setConnection(data['connection']);
                $('#table').html(data['table']);
            });
        }
        setInterval(setData, 1000);
    </script>

@endsection

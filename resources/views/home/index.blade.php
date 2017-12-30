@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row clearfix">
        <div class="col-xs-4">
            <div id="temps_div" class="plot"></div>
            @linechart('Temps', 'temps_div')
        </div>

        <div class="col-xs-4">
            <div id="hum_div" class="plot"></div>
            @linechart('Hum', 'hum_div')
        </div>    
    </div>

    <div class="row clearfix">
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






<div id="ustawienia" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">Ustawienia</h4>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-xs-8 col-xs-offset-2">
                        <form id="sett-form" method="post">
                            <div class="form-group">
                                <label for="time_between_water">Minimalny czas pomiędzy podlewianiami [min]</label>
                                <input type="number" class="form-control" name="time_between_water" value="{{ $settings->time_between_water }}">
                            </div>
                            <div class="form-group">
                                <label for="amount_water_to_water">Ilość wody użytej do jednorazowego podlania [ml]</label>
                                <input type="number" class="form-control" name="amount_water_to_water" value="{{ $settings->amount_water_to_water }}">
                            </div>
                            <div class="form-group">
                                <label for="amount_water_to_water">Próg wilgotności [%]</label>
                                <input type="number" class="form-control" name="treshold" value="{{ $settings->treshold }}">
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="save" type="button" class="btn btn-default">Zapisz</button>
            </div>
        </div>

    </div>
</div>


@endsection


@section('js')
    <script src="{{ asset('js/lava.js') }}"></script>
    <script type="text/javascript">
        $('#save').click(function(){
            $('#sett-form').submit();
        });


        $('#sett-form').submit(function(e){
            time_between_water = $('input[name="time_between_water"').val();
            amount_water_to_water = $('input[name="amount_water_to_water"').val();
            treshold = $('input[name="treshold"').val();
            saveSettings(time_between_water, amount_water_to_water, treshold);
            e.preventDefault();
        });

        function saveSettings(time_between_water, amount_water_to_water, treshold) {
            $.ajax({
                type: "POST",
                url: '/settings',
                headers: {
                  'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                data: {time_between_water: time_between_water, amount_water_to_water: amount_water_to_water, treshold: treshold},
                success: function( msg ) {
                }
                                     
            });
            $('#ustawienia').modal('hide');    
        }



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

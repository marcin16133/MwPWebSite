@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div id="table">
                @include('home.table')
            </div> 




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
            lava.loadData('Temps', data['temperatures'], function (chart) {
                console.log("sadasd");
                console.log(chart);
            });
            $('#table').html(data['table']);
        });
    }
    setInterval(setData, 1000);
    </script>

@endsection

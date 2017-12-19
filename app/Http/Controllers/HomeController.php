<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Measure;
use App\Helpers\Plants;


class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
        date_default_timezone_set("Europe/Warsaw");
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {

        $response = $this->setData(false);


        \Lava::LineChart('Temps', $response['temperatures'], [
            'title' => 'Temperatura',
            'legend' => [
                'position' => 'none'
            ],
            'hAxis' => [
                'title' => 'Godzina'
            ],
            'vAxis' => [
                'title' => 'Temperatura[*]'
            ]
        ]);

        \Lava::LineChart('Hum', $response['hum'], [
            'title' => 'Wilgotność',
            'legend' => [
                'position' => 'none'
            ],
            'hAxis' => [
                'title' => 'Godzina'
            ],
            'vAxis' => [
                'title' => 'Wilgotność[%]'
            ]
        ]);

        \Lava::LineChart('HumEarth', $response['humearth'], [
            'title' => 'Wilgotność gleby',
            'legend' => [
                'position' => 'none'
            ],
            'hAxis' => [
                'title' => 'Godzina'
            ],
            'vAxis' => [
                'title' => 'Wilgotność[%]'
            ]
        ]);
        
        
        $conn = $this->checkConnection(strtotime($response['measures'][0]->date));
        return view('home.index', ['measures' => $response['measures'], 'connection' => $conn]);
    }

    private function checkConnection($time)
    {
        if ((time() - $time) > 360){
            return false;
        }
        return true;
    }


    public function plotData(){
        $response = $this->setData(true);
        $response['water_level'] = Measure::orderBy('date', true)->first()->water_level;
        return response()->json($response);
    }


    private function setData($render = true){
        $count = 5; // ile ostatnich
        $measures = Measure::orderBy('date', true)->limit($count)->get();



        $temperatures = \Lava::DataTable();
        $temperatures->addStringColumn('Data')
                     ->addNumberColumn('Temperatura');

        foreach ($measures as $measure) {
            $temperatures->addRow([explode(' ',$measure->date)[1],  $measure->temp]);
        }

        $hum = \Lava::DataTable();
        $hum->addStringColumn('Data')
                     ->addNumberColumn('Temperatura');

        foreach ($measures as $measure) {
            $hum->addRow([explode(' ',$measure->date)[1],  $measure->hum]);
        }

        $humearth = \Lava::DataTable();
        $humearth->addStringColumn('Data')
                     ->addNumberColumn('Temperatura');

        foreach ($measures as $measure) {
            $humearth->addRow([explode(' ',$measure->date)[1],  $measure->humearth]);
        }


        $connection = $this->checkConnection(strtotime($measures[0]->date));

        if ($render)
            return array('table' => $this->getTable($measures), 'temperatures' => $temperatures, 'hum' => $hum, 'humearth' => $humearth, 'connection' => $connection);
        else
            return array('measures' => $measures, 'temperatures' => $temperatures, 'hum' => $hum, 'humearth' => $humearth, 'connection' => $connection);

    }



    private function getTable($measures)
    {
        $returnHTML = view('home.table')->with('measures', $measures)->render();
        return $returnHTML;
        
    }
}

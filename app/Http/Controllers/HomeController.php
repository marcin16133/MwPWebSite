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
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $plants = new Plants();
        $plants->callForPlants();

        $response = $this->setData(false);




        \Lava::LineChart('Temps', $response['temperatures'], [
            'title' => 'Weather in October'
        ]);
        


        return view('home.index')->with('measures',$response['measures']);
    }


    public function plotData(){
        $response = $this->setData(true);
        return response()->json($response);
    }


    private function setData($render = true){
        $count = 10; // ile ostatnich
        $measures = Measure::orderBy('date', true)->limit($count)->get();

        $temperatures = \Lava::DataTable();
        $temperatures->addDateColumn('Data')
                     ->addNumberColumn('Temperatura');

        foreach ($measures as $measure) {
            $temperatures->addRow([$measure->date,  $measure->temp]);
        }
        if ($render)
            return array('table' => $this->getTable($measures), 'temperatures' => $temperatures);
        else
            return array('measures' => $measures, 'temperatures' => $temperatures);

    }



    private function getTable($measures)
    {
        $returnHTML = view('home.table')->with('measures', $measures)->render();
        return $returnHTML;
        
    }
}

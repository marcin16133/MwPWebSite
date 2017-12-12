<?php

use Illuminate\Database\Seeder;

class MeasuresTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	$faker = Faker\Factory::create();
        for ($i = 0; $i < 1; $i++){
        	$measure = new App\Measure();
        	$measure->temp = $faker->numberBetween(10,30);
        	$measure->hum = $faker->numberBetween(10,30);
        	$measure->humearth = $faker->numberBetween(10,30);
        	$measure->water_level = $faker->numberBetween(10,30);
        	$measure->date = $faker->dateTimeBetween('-1 years');
        	$measure->save();
        }
    }
}

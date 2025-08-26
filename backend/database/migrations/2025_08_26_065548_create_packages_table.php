<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('itinerary_id');
            $table->string('title');
            $table->string('start_location');
            $table->date('valid_till');
            $table->json('description');
            $table->integer('price');
            $table->enum('price_type', ['per_person', 'total']);
            $table->json('locations');
            $table->json('inclusions');
            $table->json('exclusions');
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            
            $table->foreign('itinerary_id')->references('id')->on('itineraries')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('packages');
    }
};

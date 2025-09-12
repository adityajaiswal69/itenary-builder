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
        Schema::table('company_details', function (Blueprint $table) {
            $table->string('facebook_url')->nullable()->after('website');
            $table->string('whatsapp_url')->nullable()->after('facebook_url');
            $table->string('instagram_url')->nullable()->after('whatsapp_url');
            $table->string('youtube_url')->nullable()->after('instagram_url');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('company_details', function (Blueprint $table) {
            $table->dropColumn(['facebook_url', 'whatsapp_url', 'instagram_url', 'youtube_url']);
        });
    }
};

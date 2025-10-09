<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $itinerary->title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
            font-size: 18px;
        }
        .page {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
            position: relative;
        }
        .cover-page {
            position: relative;
            height: 297mm;
        }
        .header-section {
            position: relative;
            height: 250px;
            margin: 0;
            padding: 0;
            overflow: hidden;
            width: 100%;
        }
        .cover-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
        }
        .header-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            text-align: center;
            padding: 0;
            color: white;
            width: 100%;
        }
        .company-info {
            text-align: center;
            padding: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        .package-details {
            padding: 20px 10px 20px 40px;
            margin-top: 30px;
            margin-bottom: 30px;
        }
        .package-details-flex {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .package-details-column {
            display: table-cell;
            width: 70%;
            vertical-align: top;
            padding-right: 20px;
            word-wrap: break-word;
        }
        .cost-column {
            display: table-cell;
            width: 30%;
            vertical-align: top;
            text-align: center;
        }
        .cost-box {
            background: #f0fdf4;
            padding: 25px;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            width: 180px;
            height: 180px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            flex-shrink: 0;
        }
        .contact-info {
            background: #f8f9fa;
            padding: 20px 10px 20px 40px;
            border-left: 4px solid #dc2626;
            margin: 30px 0;
        }
        .footer {
            position: absolute;
            bottom: 15px;
            left: 30px;
            right: 30px;
            font-size: 16px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding: 20px 0;
        }
        .footer-content {
            display: table;
            width: 100%;
        }
        .footer-left {
            display: table-cell;
            width: 70%;
            vertical-align: middle;
            padding-right: 20px;
        }
        .footer-left {
            white-space: nowrap;
        }
        .footer-right {
            display: table-cell;
            width: 30%;
            text-align: right;
            vertical-align: middle;
            font-weight: 600;
            padding-left: 20px;
        }
        .summary-page {
            font-family: Arial, sans-serif;
            line-height: 1.3;
            color: #333;
            width: 210mm;
            padding: 10px;
            margin: 0;
            height: 297mm;
            background: white;
            position: relative;
            padding-bottom: 50px;
        }
        .day-item {
            margin-bottom: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-left: 6px solid #3b82f6;
            border-radius: 8px;
            margin-left: 40px;
            margin-right: 40px;
        }
        .day-title {
            font-weight: bold;
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 8px;
        }
        .day-date {
            font-size: 18px;
            font-weight: normal;
            color: #718096;
        }
        .inclusions-exclusions {
            font-family: Arial, sans-serif;
            line-height: 1.3;
            color: #333;
            width: 210mm;
            padding: 8px;
            margin: 0;
            height: 297mm;
            background: white;
            position: relative;
            padding-bottom: 50px;
        }
        .detailed-itinerary-page {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            width: 210mm;
            padding: 10px;
            margin: 0;
            min-height: 297mm;
            background: white;
            position: relative;
            padding-bottom: 60px;
        }
        .inclusions-exclusions-flex {
            display: table;
            width: 100%;
            margin-bottom: 40px;
            margin-left: 40px;
            margin-right: 40px;
        }
        .inclusions-section, .exclusions-section {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 20px;
        }
        .exclusions-section {
            padding-right: 0;
            padding-left: 20px;
        }
        .inclusions-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #166534;
        }
        .exclusions-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #dc2626;
        }
        .list-item {
            margin-bottom: 5px;
        }
        .company-details-section {
            margin-top: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-left: 6px solid #3b82f6;
            margin-left: 40px;
            margin-right: 40px;
            border-radius: 8px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 20px 0;
            color: #1f2937;
        }
        .company-info-details {
            font-size: 18px;
            color: #4b5563;
            line-height: 1.6;
        }
        .company-info-item {
            margin-bottom: 12px;
        }
        .social-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #cbd5e1;
        }
        .social-links-title {
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
            font-size: 20px;
        }
        .social-links-list {
            display: flex;
            flex-wrap: wrap;
            gap: 25px;
        }
        .social-link {
            color: #1e40af;
            text-decoration: underline;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="page cover-page">
        <!-- Header with Cover Image -->
        <div class="header-section">
            @if($itinerary->cover_image && $coverImageBase64 && strpos($coverImageBase64, 'data:') === 0)
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; background: #f0f0f0;">
                    <img src="{{ $coverImageBase64 }}" alt="Cover Image" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); min-width: 100%; min-height: 100%; width: auto; height: auto; object-fit: cover; object-position: center;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                    <!-- Fallback content that shows if image fails to load -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: none; align-items: center; justify-content: center;">
                        <div style="text-align: center; color: white; opacity: 0.8;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🏔️</div>
                            <div style="font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Travel & Tourism</div>
                            <div style="font-size: 16px; margin-top: 10px;">Adventure Awaits</div>
                        </div>
                    </div>
                </div>
            @else
                <!-- Fallback gradient background when no cover image -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: white; opacity: 0.8;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🏔️</div>
                        <div style="font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Travel & Tourism</div>
                        <div style="font-size: 16px; margin-top: 10px;">Adventure Awaits</div>
                    </div>
                </div>
            @endif
            <div class="cover-overlay"></div>
            <div class="header-content">
                <h1 style="font-size: 32px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.7); text-transform: uppercase; letter-spacing: 1px; text-align: center;">{{ $itinerary->title }}</h1>
            </div>
        </div>

        <!-- Company Information -->
        <div class="company-info">
            @if($companyDetails && $companyDetails->logo)
                <img src="{{ $logoBase64 }}" alt="Company Logo" style="max-height: 50px; max-width: 150px; object-fit: contain;" />
            @endif
            <div style="font-size: 36px; font-weight: bold; color: #1f2937; margin-bottom: 12px;">{{ $companyDetails->company_name ?? 'Company Name' }}</div>
            <div style="font-size: 24px; color: #6b7280;">Travel & Tourism</div>
        </div>

        <!-- Package Details -->
        <div class="package-details">
            <div class="package-details-flex">
                <div class="package-details-column">
                    <h3 style="font-size: 28px; font-weight: bold; margin: 0 0 20px 0; color: #374151;">Package Details</h3>
                    <div style="font-size: 22px; color: #4b5563; line-height: 1.6;">
                        <div style="margin-bottom: 12px;"><strong>Date of Travel:</strong> {{ date('F j, Y') }}</div>
                        <div style="margin-bottom: 12px;"><strong>Number of Pax:</strong> {{ $package->people ?? 1 }} Adults</div>
                        <div style="margin-bottom: 12px;"><strong>Number of Room:</strong> {{ ceil(($package->people ?? 1) / 2) }} Room</div>
                        <div style="margin-bottom: 12px;"><strong>Valid Till:</strong> {{ $package->valid_till ? date('F j, Y', strtotime($package->valid_till)) : 'Not specified' }}</div>
                        <div style="margin-bottom: 12px;"><strong>Start Location:</strong> {{ $package->start_location ?? 'Not specified' }}</div>
                        <div><strong>Mode of Transport:</strong> Tempo Traveler</div>
                    </div>
                </div>
                
                <div class="cost-column">
                    <div class="cost-box">
                        <h3 style="font-size: 24px; font-weight: bold; margin: 0 0 12px 0; color: #166534;">Total Cost</h3>
                        <div style="font-size: 36px; font-weight: bold; color: #166534; margin-bottom: 8px;">{{ $package->price ? '₹ ' . number_format($package->price) : '' }}</div>
                        <div style="font-size: 18px; color: #15803d;">Per Person</div>
                    </div>
                </div>
            </div>
            
            <div style="display: table; width: 100%;">
                    <div style="display: table-cell; width: 90%; vertical-align: top; padding-right: 20px;">
                        <h3 style="font-size: 28px; font-weight: bold; margin: 0 0 20px 0; color: #1f2937;">Package Description</h3>
                        <div style="font-size: 20px; color: #374151; line-height: 1.5;">{!! $packageDescription !!}</div>
                    </div>
                    <div style="display: table-cell; width: 10%; vertical-align: top;">
                        <!-- Empty space for better layout balance -->
                    </div>
                </div>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <h4 style="font-size: 26px; font-weight: bold; margin: 0 0 20px 0; color: #dc2626;">For more info:</h4>
                <div style="font-size: 22px; color: #1e40af; line-height: 1.6;">
                    <div style="margin-bottom: 12px;"><strong>Website:</strong> {{ $companyDetails->website ?? '' }}</div>
                    <div style="margin-bottom: 12px;"><strong>Email:</strong> {{ $companyDetails->email ?? $user->email ?? 'info@company.com' }}</div>
                    <div style="margin-bottom: 12px;"><strong>Phone:</strong> {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</div>
                    <div style="margin-bottom: 12px;"><strong>Address:</strong> {{ $companyDetails->address ?? '' }}</div>
                </div>
                
                <!-- Regards Section -->
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
                    <div style="font-size: 22px; color: #374151; line-height: 1.6;">
                        <div style="font-weight: bold; margin-bottom: 12px;">Regards (For any enquiries, please feel free to call us):</div>
                        <div style="margin-bottom: 12px;"><strong>{{ $companyDetails->company_name ?? 'Company Name' }}</strong> - {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</div>
                        <div><strong>Office</strong> - {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Page 1 Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    <span><strong>Mobile:</strong> {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</span>
                    <span style="margin-left: 50px; display: inline-block; min-width: 20px;"><strong>Email:</strong> {{ $companyDetails->email ?? $user->email ?? 'info@company.com' }}</span>
                </div>
                <div class="footer-right">Page 1</div>
            </div>
        </div>
    </div>
    
    <!-- Page 2: Package Summary -->
    <div class="page summary-page">
        <div style="text-align: center; margin-bottom: 40px; padding-top: 30px;">
            <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 20px 0; color: #1f2937;">Brief Itinerary</h1>
        </div>
        
        <div style="margin-bottom: 15px;">
            @foreach($days as $day)
                <div class="day-item">
                    <div class="day-title">{{ $day['title'] }}</div>
                    <div class="day-date">{{ date('D, M j, Y') }}</div>
                </div>
            @endforeach
        </div>
        
        <!-- Page 2 Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    <span><strong>Mobile:</strong> {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</span>
                    <span style="margin-left: 50px; display: inline-block; min-width: 20px;"><strong>Email:</strong> {{ $companyDetails->email ?? $user->email ?? 'info@company.com' }}</span>
                </div>
                <div class="footer-right">Page 2</div>
            </div>
        </div>
    </div>

    <!-- Inclusions & Exclusions Page -->
    <div class="page inclusions-exclusions">
        <!-- Page Header -->
        <div style="text-align: center; margin-bottom: 40px; padding-top: 30px;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0; color: #1f2937;">Inclusions & Exclusions</h1>
        </div>

        <!-- Inclusions & Exclusions in Flex Layout -->
        <div class="inclusions-exclusions-flex">
            <!-- Inclusions Section -->
            <div class="inclusions-section">
                <h3 class="inclusions-title">✓ Inclusions</h3>
                <div style="font-size: 18px; color: #374151; line-height: 1.6; margin-top: 15px;">{!! $packageInclusions !!}</div>
            </div>

            <!-- Exclusions Section -->
            <div class="exclusions-section">
                <h3 class="exclusions-title">✗ Exclusions</h3>
                <div style="font-size: 18px; color: #374151; line-height: 1.6; margin-top: 15px;">{!! $packageExclusions !!}</div>
            </div>
        </div>

        <!-- Contact Information -->
        <div class="company-details-section">
            <h3 class="company-name">{{ $companyDetails->company_name ?? 'Company Name' }}</h3>
            <div class="company-info-details">
                <div class="company-info-item"><strong>Website:</strong> {{ $companyDetails->website ?? '' }}</div>
                <div class="company-info-item"><strong>Email:</strong> {{ $companyDetails->email ?? $user->email ?? 'info@company.com' }}</div>
                <div class="company-info-item"><strong>Phone:</strong> {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</div>
                <div class="company-info-item"><strong>Address:</strong> {{ $companyDetails->address ?? '' }}</div>
                
                <!-- Social Media Links -->
                @include('pdf.partials.social-links', ['companyDetails' => $companyDetails])
            </div>
        </div>

        <!-- Page Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    <span><strong>Mobile:</strong> {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</span>
                    <span style="margin-left: 50px; display: inline-block; min-width: 20px;"><strong>Email:</strong> {{ $companyDetails->email ?? $user->email ?? 'info@company.com' }}</span>
                </div>
                <div style="font-weight: 600;">Page 3</div>
            </div>
        </div>
    </div>

    <!-- Detailed Itinerary Pages -->
    @foreach($days as $dayIndex => $day)
        <div class="detailed-itinerary-page" style="page-break-before: always;">
        
        <!-- Detailed Itinerary Header -->
        <div style="text-align: center; margin-bottom: 50px; padding-top: 40px; border-bottom: 2px solid #d97706; padding-bottom: 20px;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0; color: #d97706; text-transform: uppercase; letter-spacing: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">DETAILED ITINERARY</h1>
        </div>

        @php
            // Get the title from the first event (which contains the journey info)
            $dayTitle = '';
            $dayDescription = '';
            $dayImages = [];
            $allEvents = [];
            
            if (isset($day['events']) && is_array($day['events']) && count($day['events']) > 0) {
                $dayTitle = $day['events'][0]['title'] ?? '';
                $dayDescription = $day['events'][0]['notes'] ?? '';
                $allEvents = $day['events'];
                
                // Collect all images from all events in this day
                foreach ($day['events'] as $event) {
                    if (isset($event['images']) && is_array($event['images'])) {
                        $dayImages = array_merge($dayImages, $event['images']);
                    }
                }
            }
            
            // Fallback to day title if no events
            if (empty($dayTitle)) {
                $dayTitle = $day['title'] ?? 'Day ' . ($dayIndex + 1);
            }
            
            // Clean up description HTML
            $dayDescription = strip_tags($dayDescription, '<p><br><strong><em>');
        @endphp

        <!-- Day Header -->
        <div style="margin-bottom: 40px; margin-top: 20px; padding: 0 50px;">
            <h2 style="font-size: 28px; text-align: left; font-weight: bold; margin: 0 0 25px 0; color: #059669; font-style: italic; border-left: 4px solid #059669; padding-left: 15px;">
                Day {{ $dayIndex + 1 }}: {{ $dayTitle }}
            </h2>
            
            <!-- Day Description -->
            @if($dayDescription)
                <div style="font-size: 22px; color: #374151; line-height: 1.8; margin-bottom: 35px; margin-top: 15px; text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    {!! $dayDescription !!}
                </div>
            @endif
        </div>

        <!-- Main Content Area with Collage Grid Images -->
        <div style="margin-bottom: 40px; margin-top: 20px; padding: 0 50px;">
            @if(count($dayImages) > 0)
                @if(count($dayImages) == 1)
                    <!-- Single Image - Full Width with Proper Aspect Ratio -->
                    <div style="margin-bottom: 40px; text-align: center;">
                        @php
                            $mainImage = $dayImages[0];
                            $imageBase64 = $imageBase64Map[$mainImage] ?? $mainImage;
                        @endphp
                        <div style="display: inline-block; max-width: 100%;">
                            <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image" style="max-width: 100%; height: auto; max-height: 600px; min-height: 500px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb;" />
                        </div>
                    </div>
                @elseif(count($dayImages) == 2)
                    <!-- Two Images - Collage Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 40px;">
                        @foreach($dayImages as $imageIndex => $image)
                            @php
                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                            @endphp
                            <div style="display: flex; justify-content: center; align-items: center; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb; background: #f8f9fa;">
                                <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image {{ $imageIndex + 1 }}" style="width: 100%; height: 450px; object-fit: cover; object-position: center;" />
                            </div>
                        @endforeach
                    </div>
                @elseif(count($dayImages) == 3)
                    <!-- Three Images - Collage Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 25px; margin-bottom: 40px;">
                        @foreach($dayImages as $imageIndex => $image)
                            @php
                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                            @endphp
                            <div style="display: flex; justify-content: center; align-items: center; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb; background: #f8f9fa;">
                                <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image {{ $imageIndex + 1 }}" style="width: 100%; height: 400px; object-fit: cover; object-position: center;" />
                            </div>
                        @endforeach
                    </div>
                @elseif(count($dayImages) == 4)
                    <!-- Four Images - 2x2 Collage Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 25px; margin-bottom: 40px;">
                        @foreach($dayImages as $imageIndex => $image)
                            @php
                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                            @endphp
                            <div style="display: flex; justify-content: center; align-items: center; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb; background: #f8f9fa;">
                                <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image {{ $imageIndex + 1 }}" style="width: 100%; height: 350px; object-fit: cover; object-position: center;" />
                            </div>
                        @endforeach
                    </div>
                @elseif(count($dayImages) == 5)
                    <!-- Five Images - Collage Grid -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 25px; margin-bottom: 40px;">
                        <!-- Large main image -->
                        <div style="grid-row: 1 / 3; display: flex; justify-content: center; align-items: center; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb; background: #f8f9fa; min-height: 500px;">
                            @php
                                $mainImage = $dayImages[0];
                                $imageBase64 = $imageBase64Map[$mainImage] ?? $mainImage;
                            @endphp
                            <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image 1" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
                        </div>
                        <!-- Four smaller images -->
                        @foreach(array_slice($dayImages, 1, 4) as $imageIndex => $image)
                            @php
                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                            @endphp
                            <div style="display: flex; justify-content: center; align-items: center; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb; background: #f8f9fa; min-height: 240px;">
                                <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image {{ $imageIndex + 2 }}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
                            </div>
                        @endforeach
                    </div>
                @elseif(count($dayImages) == 6)
                    <!-- Six Images - 2x3 Collage Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 25px; margin-bottom: 40px;">
                        @foreach($dayImages as $imageIndex => $image)
                            @php
                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                            @endphp
                            <div style="display: flex; justify-content: center; align-items: center; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb; background: #f8f9fa;">
                                <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image {{ $imageIndex + 1 }}" style="width: 100%; height: 320px; object-fit: cover; object-position: center;" />
                            </div>
                        @endforeach
                    </div>
                @else
                    <!-- Seven or More Images - Masonry Collage Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 40px;">
                        @foreach(array_slice($dayImages, 0, 9) as $imageIndex => $image)
                            @php
                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                            @endphp
                            <div style="display: flex; justify-content: center; align-items: center; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #e5e7eb; background: #f8f9fa; min-height: 300px;">
                                <img src="{{ $imageBase64 }}" alt="Day {{ $dayIndex + 1 }} Image {{ $imageIndex + 1 }}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
                            </div>
                        @endforeach
                    </div>
                @endif
            @endif
        </div>

        <!-- Events Section - Show all events for the day -->
        @if(count($allEvents) > 0)
            <div style="margin-bottom: 30px; margin-top: 30px; padding: 0 50px;">
                <h3 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 25px 0 25px 0; text-align: left; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Day Activities & Schedule</h3>
                
                @foreach($allEvents as $eventIndex => $event)
                    @php
                        $eventTitle = $event['title'] ?? '';
                        $eventCategory = $event['category'] ?? '';
                        $eventSubCategory = $event['subCategory'] ?? '';
                        $eventNotes = $event['notes'] ?? '';
                        $eventImages = $event['images'] ?? [];
                        $eventTime = $event['time'] ?? '';
                        $eventAmount = $event['amount'] ?? 0;
                        $eventCurrency = $event['currency'] ?? '₹';
                        
                        // Clean up notes HTML
                        $eventNotes = strip_tags($eventNotes, '<p><br><strong><em><ul><li>');
                    @endphp
                    
                    <div style="background: #f8f9fa; border-left: 6px solid #3b82f6; border-radius: 12px; padding: 25px; margin-bottom: 25px; page-break-inside: avoid; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <!-- Event Header -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <h4 style="font-size: 22px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0; line-height: 1.3;">
                                    {{ $eventTitle }}
                                </h4>
                                <div style="font-size: 16px; color: #6b7280; margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
                                    @if($eventCategory)
                                        <span style="background: #e5e7eb; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">{{ $eventCategory }}</span>
                                    @endif
                                    @if($eventSubCategory && $eventSubCategory !== $eventCategory)
                                        <span style="background: #dbeafe; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">{{ $eventSubCategory }}</span>
                                    @endif
                                    @if($eventTime)
                                        <span style="background: #fef3c7; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">🕐 {{ $eventTime }}</span>
                                    @endif
                                </div>
                            </div>
                            @if($eventAmount > 0)
                                <div style="text-align: right; margin-left: 20px;">
                                    <div style="font-size: 20px; font-weight: bold; color: #166534; background: #f0fdf4; padding: 8px 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
                                        {{ $eventCurrency }} {{ number_format($eventAmount) }}
                                    </div>
                                </div>
                            @endif
                        </div>
                        
                        <!-- Event Description -->
                        @if($eventNotes)
                            <div style="font-size: 18px; color: #374151; line-height: 1.7; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                {!! $eventNotes !!}
                            </div>
                        @endif
                        
                        <!-- Event Images -->
                        @if(count($eventImages) > 0)
                            <div style="margin-top: 20px;">
                                @if(count($eventImages) === 1)
                                    <div style="text-align: center;">
                                        @php
                                            $imageBase64 = $imageBase64Map[$eventImages[0]] ?? $eventImages[0];
                                        @endphp
                                        <img src="{{ $imageBase64 }}" alt="{{ $eventTitle }}" style="max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); border: 2px solid #e5e7eb;" />
                                    </div>
                                @elseif(count($eventImages) === 2)
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                        @foreach($eventImages as $image)
                                            @php
                                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                                            @endphp
                                            <div style="text-align: center;">
                                                <img src="{{ $imageBase64 }}" alt="{{ $eventTitle }}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;" />
                                            </div>
                                        @endforeach
                                    </div>
                                @else
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                                        @foreach($eventImages as $image)
                                            @php
                                                $imageBase64 = $imageBase64Map[$image] ?? $image;
                                            @endphp
                                            <div style="text-align: center;">
                                                <img src="{{ $imageBase64 }}" alt="{{ $eventTitle }}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;" />
                                            </div>
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        @endif

        <!-- Footer Section -->
        <div style="position: absolute; bottom: 30px; left: 50px; right: 50px;">
            <div style="display: flex; align-items: center; font-size: 20px; color: #374151; margin-bottom: 25px; font-weight: 500;">
                <span style="margin-right: 12px; font-size: 22px; color: #f59e0b;">🌙</span>
                <span>Night stay in {{ explode(' to ', $dayTitle)[1] ?? 'destination' }}.</span>
            </div>
            
            <!-- Contact Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 12px; color: #6b7280;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 30px;">
                        <span><strong>Mobile:</strong> {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</span>
                        <span style="margin-left: 50px; display: inline-block; min-width: 20px;"><strong>Email:</strong> {{ $companyDetails->email ?? $user->email ?? 'info@company.com' }}</span>
                    </div>
                    <div style="font-weight: 600;">Page {{ $dayIndex + 4 }}</div>
                </div>
            </div>
        </div>
        </div>
    @endforeach
</body>
</html>


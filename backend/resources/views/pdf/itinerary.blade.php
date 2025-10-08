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
            @if($itinerary->cover_image)
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('{{ $coverImageBase64 }}'); background-size: cover; background-position: center;"></div>
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
            
            <div style="margin: 30px 0; padding: 20px 10px 20px 40px; background: #f8f9fa; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h3 style="font-size: 28px; font-weight: bold; margin: 0 0 20px 0; color: #1f2937;">Package Description</h3>
                <div style="font-size: 22px; color: #374151; line-height: 1.6;">{!! $packageDescription !!}</div>
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
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 10px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 60px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #1f2937; text-transform: uppercase;">DETAILED ITINERARY</h1>
                <h2 style="font-size: 18px; font-weight: 600; margin: 0; color: #059669; font-style: italic;">{{ $day['title'] }}</h2>
                <div style="font-size: 12px; color: #6b7280;">{{ date('D, M j, Y') }}</div>
            </div>

            <div style="margin-bottom: 20px;">
                @foreach($day['events'] ?? [] as $event)
                    <div style="margin-bottom: 15px; page-break-inside: avoid;">
                        <!-- Event title -->
                        <h4 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0; text-transform: uppercase;">{{ $event['title'] }}</h4>
                        
                        <!-- Event details -->
                        <div style="margin-bottom: 12px; font-size: 14px; color: #374151; line-height: 1.6;">
                            @if(isset($event['category']))
                                {{ $event['category'] }}
                            @endif
                            @if(isset($event['subCategory']) && $event['subCategory'] !== $event['category'])
                                | {{ $event['subCategory'] }}
                            @endif
                            @if(isset($event['type']))
                                | <strong>Type:</strong> {{ $event['type'] }}
                            @endif
                            @if(isset($event['time']))
                                | <strong>Time:</strong> {{ $event['time'] }}
                            @endif
                        </div>
                        
                        <!-- Event description -->
                        @if(isset($event['notes']) && $event['notes'])
                            <div style="margin-bottom: 12px;">
                                <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6; text-align: justify;">{{ strip_tags($event['notes']) }}</p>
                            </div>
                        @endif
                        
                        <!-- Event images -->
                        @if(isset($event['images']) && is_array($event['images']) && count($event['images']) > 0)
                            @include('pdf.partials.image-grid', ['images' => $event['images'], 'imageBase64Map' => $imageBase64Map])
                        @endif
                        
                        <!-- Price information -->
                        @if(isset($event['amount']) && $event['amount'])
                            <div style="margin-top: 8px; font-size: 13px; color: #166534; font-weight: 600;">
                                <strong>Cost:</strong> {{ $event['currency'] ?? 'USD' }} {{ number_format($event['amount']) }}
                                @if(isset($event['bookedThrough']))
                                    (Booked through: {{ $event['bookedThrough'] }})
                                @endif
                            </div>
                        @endif
                        
                        <div style="border-bottom: 1px solid #e5e7eb; margin: 10px 0;"></div>
                    </div>
                @endforeach
            </div>
            
            <!-- Footer for each day page -->
            <div style="position: absolute; bottom: 20px; left: 40px; right: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 30px;">
                        <span><strong>Mobile:</strong> {{ $companyDetails->phone ?? $user->phone ?? 'Contact Number' }}</span>
                        <span style="margin-left: 50px; display: inline-block; min-width: 20px;"><strong>Email:</strong> {{ $companyDetails->email ?? $user->email ?? 'info@company.com' }}</span>
                    </div>
                    <div style="font-weight: 600;">Page {{ $dayIndex + 4 }}</div>
                </div>
            </div>
        </div>
    @endforeach
</body>
</html>


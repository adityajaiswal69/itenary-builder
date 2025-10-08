@if($companyDetails)
    @php
        $links = [];
        if ($companyDetails->facebook_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->facebook_url) . '" target="_blank" style="color: #1877f2; text-decoration: underline; font-size: 11px;">📘 Facebook</a>';
        }
        if ($companyDetails->whatsapp_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->whatsapp_url) . '" target="_blank" style="color: #25d366; text-decoration: underline; font-size: 11px;">📱 WhatsApp</a>';
        }
        if ($companyDetails->instagram_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->instagram_url) . '" target="_blank" style="color: #e4405f; text-decoration: underline; font-size: 11px;">📷 Instagram</a>';
        }
        if ($companyDetails->youtube_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->youtube_url) . '" target="_blank" style="color: #ff0000; text-decoration: underline; font-size: 11px;">📺 YouTube</a>';
        }
    @endphp
    
    @if(!empty($links))
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
            <div style="font-weight: bold; margin-bottom: 5px; color: #1f2937;">Follow Us:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">{!! implode('', $links) !!}</div>
        </div>
    @endif
@endif


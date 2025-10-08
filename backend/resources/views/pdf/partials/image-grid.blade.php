@if(!empty($images))
    @php
        $displayImages = array_slice($images, 0, $maxImages ?? 4);
        $remainingCount = count($images) - count($displayImages);
    @endphp
    
    @if(count($displayImages) === 1)
        @php $imageBase64 = $imageBase64Map[$displayImages[0]] ?? $displayImages[0]; @endphp
        <div style="margin: 0; text-align: center;">
            <img src="{{ $imageBase64 }}" alt="Event image" style="max-width: 100%; max-height: 250px; object-fit: cover; border-radius: 0;" />
        </div>
    @elseif(count($displayImages) === 2)
        <div style="display: flex; gap: 0; margin: 0;">
            @foreach($displayImages as $img)
                @php $imageBase64 = $imageBase64Map[$img] ?? $img; @endphp
                <div style="flex: 1;">
                    <img src="{{ $imageBase64 }}" alt="Event image" style="width: 100%; height: 180px; object-fit: cover; border-radius: 0;" />
                </div>
            @endforeach
        </div>
    @else
        {{-- 3+ images - 2x2 grid --}}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 0;">
            @foreach($displayImages as $img)
                @php $imageBase64 = $imageBase64Map[$img] ?? $img; @endphp
                <div>
                    <img src="{{ $imageBase64 }}" alt="Event image" style="width: 100%; height: 140px; object-fit: cover; border-radius: 0;" />
                </div>
            @endforeach
            @if($remainingCount > 0)
                <div style="display: flex; align-items: center; justify-content: center; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 0; height: 140px; color: #6c757d; font-size: 12px; font-weight: 500;">
                    +{{ $remainingCount }} more
                </div>
            @endif
        </div>
    @endif
@endif


# 🚀 Itinerary Viewer Iframe Integration

This feature allows you to embed your itinerary viewer on any external website using an iframe. Perfect for travel agencies, tour operators, or anyone who wants to showcase their itineraries on their own websites.

## ✨ Features

- **Responsive Design**: Works seamlessly on all devices and screen sizes
- **Interactive Elements**: Full functionality including image galleries, day-by-day views, and package details
- **Customizable**: Adjustable dimensions and styling to match your website's design
- **Secure**: Only published itineraries can be embedded
- **Fast Loading**: Optimized for quick loading and smooth user experience

## 🔧 How to Use

### 1. Create and Publish an Itinerary

First, you need to create an itinerary in the Itinerary Builder and publish it:

1. Go to the Itinerary Builder
2. Create your itinerary with all the details
3. Click "Publish Itinerary" to make it publicly accessible
4. The system will generate a unique share UUID

### 2. Copy the Iframe Code

1. Go to the Packages List
2. Find your published package
3. Click the **"Copy Iframe"** button (new button with code icon)
4. The iframe HTML code will be copied to your clipboard

### 3. Embed on Your Website

Paste the copied iframe code into your HTML where you want the itinerary to appear:

```html
<iframe 
    src="https://yourdomain.com/iframe/SHARE_UUID" 
    width="100%" 
    height="800" 
    frameborder="0" 
    style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>
```

## 🎨 Customization Options

### Basic Customization

```html
<!-- Fixed dimensions -->
<iframe src="https://yourdomain.com/iframe/SHARE_UUID" width="800" height="600"></iframe>

<!-- Responsive dimensions -->
<iframe src="https://yourdomain.com/iframe/SHARE_UUID" width="100%" height="800"></iframe>

<!-- Custom styling -->
<iframe 
    src="https://yourdomain.com/iframe/SHARE_UUID" 
    width="100%" 
    height="800" 
    style="border: 2px solid #007bff; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
</iframe>
```

### Advanced Customization

```html
<!-- With custom CSS classes -->
<iframe 
    src="https://yourdomain.com/iframe/SHARE_UUID" 
    width="100%" 
    height="800" 
    class="itinerary-embed custom-shadow">
</iframe>

<!-- Responsive container -->
<div class="itinerary-container">
    <iframe 
        src="https://yourdomain.com/iframe/SHARE_UUID" 
        width="100%" 
        height="800" 
        style="aspect-ratio: 16/9;">
    </iframe>
</div>
```

## 📱 Responsive Design

The iframe content is fully responsive and will adapt to different screen sizes. For best results:

- Use percentage-based widths (`width="100%"`)
- Set appropriate heights for different devices
- Consider using CSS aspect-ratio for modern browsers

## 🔒 Security & Privacy

- **Published Only**: Only published itineraries can be embedded
- **Public Access**: The iframe content is publicly accessible
- **No Authentication**: Users viewing the iframe don't need to log in
- **Rate Limiting**: Built-in protection against abuse

## 🚫 Troubleshooting

### Common Issues

1. **Blank iframe**: Make sure the itinerary is published and the share UUID is correct
2. **Loading errors**: Check that the share UUID exists and is valid
3. **Styling issues**: Ensure your CSS doesn't conflict with the iframe content

### Debug Steps

1. Verify the itinerary is published
2. Check the share UUID in the URL
3. Test the direct iframe URL in a new tab
4. Check browser console for any errors

## 📋 Example Implementation

Here's a complete example of how to implement the iframe on your website:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Travel Website</title>
    <style>
        .itinerary-section {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .itinerary-embed {
            border: none;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
        }
        .itinerary-embed:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="itinerary-section">
        <h1>Amazing Travel Packages</h1>
        <p>Explore our carefully curated itineraries below:</p>
        
        <!-- Replace SHARE_UUID with your actual itinerary share UUID -->
        <iframe 
            src="https://yourdomain.com/iframe/SHARE_UUID" 
            width="100%" 
            height="800" 
            class="itinerary-embed"
            title="Travel Itinerary">
        </iframe>
    </div>
</body>
</html>
```

## 🌟 Best Practices

1. **Performance**: Use appropriate iframe dimensions to avoid unnecessary scrolling
2. **Accessibility**: Always include a meaningful `title` attribute
3. **Mobile**: Test on various devices to ensure good user experience
4. **Loading**: Consider adding a loading state or placeholder
5. **SEO**: The iframe content won't be indexed by search engines, so provide alternative content

## 📞 Support

If you encounter any issues with the iframe integration:

1. Check that your itinerary is published
2. Verify the share UUID is correct
3. Ensure your website allows iframe embedding
4. Contact support if the issue persists

---

**Note**: The iframe functionality requires the itinerary to be published and have a valid share UUID. Unpublished itineraries cannot be embedded.


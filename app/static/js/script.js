document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('color-form');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    const backButton = document.getElementById('back-button');
    const fileInput = document.getElementById('photo-upload');
    const previewImage = document.getElementById('preview-image');

    const paletteData = {
        Winter: {
            description: "Winters have cool undertones with high contrast between their skin, hair, and eyes. Your best colors are clear, vivid, and cool-toned like icy blues, deep purples, and true reds.",
            colors: ["#0F4C81", "#5D8CAE", "#963D5A", "#D1435B", "#2C4D56", "#E6E6E6"],
            recommendations: {
                makeup: "Cool-toned lipsticks, rosy blushes",
                clothing: "Jewel tones, crisp whites",
                accessories: "Silver jewelry, clear stones",
                hair: "Ash tones, platinum highlights"
            }
        },
        Autumn: {
            description: "Autumns have warm, muted undertones. Your best colors are earthy, rich, and soft like olive green, mustard, burnt orange, and warm browns.",
            colors: ["#8B5E3C", "#D4A76A", "#A0522D", "#C46210", "#7B3F00", "#FFEBCD"],
            recommendations: {
                makeup: "Warm browns, peachy blushes",
                clothing: "Earthy tones, warm neutrals",
                accessories: "Bronze jewelry, natural stones",
                hair: "Warm browns, copper highlights"
            }
        },
        Spring: {
            description: "Springs have warm, bright undertones. Your best colors are clear, warm, and light like coral, peach, and bright turquoise.",
            colors: ["#FF7F50", "#FFD700", "#FF6347", "#FFA07A", "#F0E68C", "#FFF8DC"],
            recommendations: {
                makeup: "Coral lipsticks, warm blushes",
                clothing: "Bright pastels, warm whites",
                accessories: "Gold jewelry, bright stones",
                hair: "Golden tones, light highlights"
            }
        },
        Summer: {
            description: "Summers have cool, soft undertones. Your best colors are soft, muted, and cool like lavender, soft pink, and powder blue.",
            colors: ["#B0E0E6", "#FFB6C1", "#DDA0DD", "#87CEFA", "#F5F5DC", "#FFE4E1"],
            recommendations: {
                makeup: "Soft pinks, cool blushes",
                clothing: "Pastel colors, soft neutrals",
                accessories: "Silver jewelry, soft stones",
                hair: "Ashy tones, soft highlights"
            }
        }
    };

    form.addEventListener('submit', function(e) {
        e.preventDefault();
    
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            const imageFile = fileInput.files[0];
            formData.append("image", imageFile);
    
            fetch("/analyze", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const season = data.palette_description.toLowerCase(); // contoh: "winter"
                const seasonKey = season.charAt(0).toUpperCase() + season.slice(1); // "Winter"
    
                // Set season title
                document.getElementById('season-result').textContent = `You skin season is ${seasonKey}!`;
    
                // Set description dari objek paletteData
                if (paletteData[seasonKey]) {
                    document.getElementById('season-description').textContent = paletteData[seasonKey].description;
    
                    // Set swatches warna
                    const swatches = paletteData[seasonKey].colors;
                    const swatchContainer = document.querySelector('.grid.grid-cols-3');
                    swatchContainer.innerHTML = ''; // kosongkan dulu
                    swatches.forEach(color => {
                        const swatchDiv = document.createElement('div');
                        swatchDiv.className = 'color-swatch h-16 rounded-lg';
                        swatchDiv.style.backgroundColor = color;
                        swatchContainer.appendChild(swatchDiv);
                    });
                } else {
                    document.getElementById('season-description').textContent = "No description available.";
                }
    
                // Tampilkan gambar yang di-upload
                const reader = new FileReader();
                reader.onload = function(e) {
                    const uploadedImage = document.getElementById('uploaded-image');
                    uploadedImage.src = e.target.result;
                    uploadedImage.hidden = false;
    
                    // Sembunyikan placeholder icon
                    document.getElementById('image-placeholder').style.display = 'none';
                };
                reader.readAsDataURL(imageFile);
                
                // Update seasonal recommendations
                if (paletteData[seasonKey].recommendations) {
                    const rec = paletteData[seasonKey].recommendations;
                    document.querySelectorAll('.grid.md\\:grid-cols-4 .p-4').forEach((box, index) => {
                        const keys = ['makeup', 'clothing', 'accessories', 'hair'];
                        const key = keys[index];
                        const textEl = box.querySelector('p');
                        if (textEl && rec[key]) {
                            textEl.textContent = rec[key];
                        }
                    });
                }
                // Tampilkan hasil
                uploadSection.classList.add('hidden');
                resultsSection.classList.remove('hidden');
            })
            .catch(error => {
                console.error("Error analyzing image:", error);
                alert("There was an error analyzing your photo.");
            });
        }
    });

    backButton.addEventListener('click', function() {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        form.reset();
    });

    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.classList.remove('hidden');
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    });
});
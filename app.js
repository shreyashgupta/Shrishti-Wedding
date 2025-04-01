let imagesList = [];
let currentPage = 1;
let isLoading = false; // Prevent duplicate requests
let allImagesLoaded = false; // Stop fetching when no more images
let filterSelected = false;
let api = "https://shrishti-wedding-api.onrender.com"

// Detect user type from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const userType = getQueryParam("user_type") || "bride";
document.getElementById("title").innerHTML = userType === "bride" ? "Shrishti Wedding" : "Ankur Wedding";

// Function to load images when scrolling
async function fetchImages() {
    if (isLoading || allImagesLoaded) return;

    isLoading = true;
    document.getElementById("loading").classList.remove("hidden"); // Show loading

    const folder = document.getElementById("folder").value;
    const onlySelected = document.getElementById("selectedFilter").checked;

    let url = `${api}/images?page=${currentPage}&limit=10&folder=${folder}&user_type=${userType}`;
    if (onlySelected) url += "&selected=true";
    console.log(url)
    const response = await fetch(url);
    const newImages = await response.json();

    if (newImages.length === 0) {
        allImagesLoaded = true; // Stop further requests if no images are returned
    } else {
        imagesList = [...imagesList, ...newImages]; // Append new images
        renderGallery(newImages);
        currentPage++; // Increment page
    }

    isLoading = false;
    document.getElementById("loading").classList.add("hidden"); // Hide loading
}

// Function to render images
function renderGallery(newImages) {
    const gallery = document.getElementById("gallery");

    newImages.forEach((img, index) => {
        const container = document.createElement("div");
        container.classList.add("image-container");

        const imgElement = document.createElement("img");
        imgElement.src = img.link;
        imgElement.classList.toggle("selected", img.is_selected);
        imgElement.onclick = () => openLightbox(imagesList.indexOf(img));

        const button = document.createElement("button");
        button.innerText = img.is_selected ? "Deselect" : "Select";
        button.onclick = () => toggleSelection(imagesList.indexOf(img));

        container.appendChild(imgElement);
        container.appendChild(button);
        gallery.appendChild(container);
    });

    updateSelectedCount();
}

// Scroll event listener
window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
        fetchImages();
    }
});

// Fetch folders
async function fetchFolders() {
    const response = await fetch(`${api}/folders`);
    const folders = await response.json();
    const folderSelect = document.getElementById("folder");

    folders.forEach(folder => {
        const option = document.createElement("option");
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
    });
}

async function folderToggle() {
    currentPage = 1;
    allImagesLoaded = false; // Reset loading flag
    imagesList = []; // Clear image list
    document.getElementById("gallery").innerHTML = ""; // Clear the gallery
    fetchImages(); // Fetch new images
}

async function toggleFilter() {
    currentPage = 1;
    allImagesLoaded = false; // Reset loading flag
    imagesList = []; // Clear image list
    document.getElementById("gallery").innerHTML = ""; // Clear the gallery
    fetchImages(); // Fetch new images
}

async function toggleSelection(index) {
    const image = imagesList[index];

    // Show loading indicator on the button
    const button = document.querySelectorAll(".image-container button")[index];
    button.innerText = "Processing...";
    button.disabled = true;

    // API call to update selection
    const endpoint = image.is_selected ? "deselect" : "select";
    await fetch(`${api}/${endpoint}/${image.id}?user_type=${userType}`, { method: "POST" });

    // Toggle selection state
    image.is_selected = !image.is_selected;

    // Update UI instantly
    const imgElement = document.querySelectorAll(".image-container img")[index];
    imgElement.classList.toggle("selected", image.is_selected);

    // Restore button text
    button.innerText = image.is_selected ? "Deselect" : "Select";
    button.disabled = false;

    // Update selected counts
    updateSelectedCount();
}


// Update selected count
async function updateSelectedCount() {
    const response = await fetch(`${api}/selected_count?user_type=${userType}`);
    const data = await response.json();
    document.getElementById("totalSelectedCount").innerText = `Total Selected: ${data.total_selected}`;
    const folder = document.getElementById("folder").value;
    
    const folder_response = await fetch(`${api}/selected_count?user_type=${userType}?folder=${folder}`);
    const folder_data = await response.json();
    document.getElementById("folderSelectedCount").innerText = `Selected in Folder: ${folder_data.total_selected}`;
}

// Open Lightbox
function openLightbox(index) {
    filteredImages = imagesList.filter(img => !filterSelected || img.is_selected);
    currentIndex = index;
    updateLightboxImage();
    document.getElementById("lightbox").classList.remove("hidden");
}

// Close Lightbox
document.getElementById("lightboxImage").addEventListener("click", closeLightbox);

function closeLightbox() {
    document.getElementById("lightbox").classList.add("hidden");
}

// Update Lightbox Image
function updateLightboxImage() {
    if (filteredImages.length > 0) {
        document.getElementById("lightboxImage").src = filteredImages[currentIndex].link;
    }
}

// Navigate Images in Lightbox
function prevImage() {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : filteredImages.length - 1;
    updateLightboxImage();
}

function nextImage() {
    currentIndex = (currentIndex < filteredImages.length - 1) ? currentIndex + 1 : 0;
    updateLightboxImage();
}

// Initial Load
fetchFolders().then(fetchImages);
updateSelectedCount();

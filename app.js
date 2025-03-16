let imagesList = [];
let currentPage = 1;
let filterSelected = false;
let api = "https://shrishti-wedding-api.onrender.com/"
async function folderToggle() {
    currentPage=1
    document.getElementById("page-number").innerHTML = "Page " + currentPage;
    fetchImages()
}

async function fetchImages() {
    const folder = document.getElementById("folder").value;
    const onlySelected = document.getElementById("selectedFilter").checked;

    let url = `${api}/images?page=${currentPage}&limit=20&folder=${folder}`;
    if (onlySelected) url += "&selected=true";

    const response = await fetch(url);
    imagesList = await response.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    let selectedCount = 0;
    imagesList.forEach((img, index) => {
        if (img.is_selected) selectedCount++;

        const container = document.createElement("div");
        container.classList.add("image-container");

        const imgElement = document.createElement("img");
        imgElement.src = img.link;
        imgElement.classList.toggle("selected", img.is_selected);
        imgElement.onclick = () => openLightbox(index);

        const button = document.createElement("button");
        button.innerText = img.is_selected ? "Deselect" : "Select";
        button.onclick = () => toggleSelection(index);

        container.appendChild(imgElement);
        container.appendChild(button);
        gallery.appendChild(container);
    });

    document.getElementById("selectedCount").innerText = `Selected (Page): ${selectedCount}`;
    fetchTotalSelectedCount();
}

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

async function toggleSelection(index) {
    await fetch(`${api}/select/${imagesList[index].id}`, { method: "POST" });
    fetchImages();
}

let currentIndex = 0;
let filteredImages = [];

// Open Lightbox
function openLightbox(index) {
    filteredImages = imagesList.filter(img => !filterSelected || img.is_selected);
    currentIndex = index;
    updateLightboxImage();
    document.getElementById("lightbox").classList.remove("hidden");
}

// Close Lightbox when clicking anywhere
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

// Navigate to Previous Image
function prevImage() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = filteredImages.length - 1; // Loop to last image
    }
    updateLightboxImage();
}

// Navigate to Next Image
function nextImage() {
    if (currentIndex < filteredImages.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0; // Loop to first image
    }
    updateLightboxImage();
}
async function fetchTotalSelectedCount() {
    const response = await fetch(`${api}/selected_count`);
    const data = await response.json();
    document.getElementById("totalSelectedCount").innerText = `Total Selected: ${data.total_selected}`;
}

function nextPage() {
    currentPage++;
    fetchImages();
    document.getElementById("page-number").innerHTML = "Page " + currentPage;
    
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchImages();
        document.getElementById("page-number").innerHTML = "Page " + currentPage;
    }
}

fetchFolders().then(fetchImages);
fetchTotalSelectedCount();
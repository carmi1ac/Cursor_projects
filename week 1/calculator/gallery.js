// Matrix Gallery - Iconic scenes from The Matrix movie
const matrixScenes = [
    {
        url: 'https://i.guim.co.uk/img/media/b251ae63d78acf9389a8fce146580483ecdd2253/57_6_1416_849/master/1416.jpg?width=465&dpr=1&s=none&crop=none',
        caption: 'The Matrix - Red Pill or Blue Pill'
    },
    {
        url: 'https://media.wired.com/photos/5ca648a330f00e47fd82ae77/3:2/w_2560%2Cc_limit/Culture_Matrix_Code_corridor.jpg',
        caption: 'Matrix Code Rain'
    },
    {
        url: 'https://media.tenor.com/qGB0yBghyEIAAAAe/neo-the-one.png',
        caption: 'Neo - The One'
    },
    {
        url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2022/09/Keanu-Reeves-as-Neo-in-the-Matrix-movies.jpg',
        caption: 'Bullet Time - Iconic Action Scene'
    },
    {
        url: 'https://pbs.twimg.com/media/Frxp0plXsAAENOY.jpg',
        caption: 'Morpheus - "Welcome to the Real World"'
    },
    {
        url: 'https://nmap.org/movies/matrix/trinity-hacking-hd-crop-960x728.jpg',
        caption: 'Trinity - The Hacker'
    },
    {
        url: 'https://static0.cbrimages.com/wordpress/wp-content/uploads/2018/06/Agent-Smith-replicated.jpg',
        caption: 'Agent Smith - The Antagonist'
    },
    {
        url: 'https://www.syfy.com/sites/syfy/files/2019/03/the_matrix_0.jpg',
        caption: 'The Construct - Training Program'
    },

];

class MatrixGallery {
    constructor() {
        this.galleryGrid = document.getElementById('galleryGrid');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxCaption = document.getElementById('lightboxCaption');
        this.lightboxClose = document.getElementById('lightboxClose');
        
        // Add gallery-page class to body for scrolling
        document.body.classList.add('gallery-page');
        
        this.init();
    }
    
    init() {
        this.renderGallery();
        this.setupEventListeners();
    }
    
    renderGallery() {
        matrixScenes.forEach((scene, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = scene.url;
            img.alt = scene.caption;
            img.loading = 'lazy';
            
            const caption = document.createElement('div');
            caption.className = 'gallery-item-caption';
            caption.textContent = scene.caption;
            
            galleryItem.appendChild(img);
            galleryItem.appendChild(caption);
            
            this.galleryGrid.appendChild(galleryItem);
        });
    }
    
    setupEventListeners() {
        // Open lightbox on image click
        this.galleryGrid.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const index = parseInt(galleryItem.dataset.index);
                this.openLightbox(index);
            }
        });
        
        // Close lightbox
        this.lightboxClose.addEventListener('click', () => {
            this.closeLightbox();
        });
        
        // Close lightbox on background click
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Close lightbox on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
                this.closeLightbox();
            }
        });
    }
    
    openLightbox(index) {
        const scene = matrixScenes[index];
        this.lightboxImage.src = scene.url;
        this.lightboxImage.alt = scene.caption;
        this.lightboxCaption.textContent = scene.caption;
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MatrixGallery();
});


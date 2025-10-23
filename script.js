// Array to store grocery items
let groceryItems = [];
let categories = new Set();

// Load items from localStorage
function loadItems() {
    try {
        const storedItems = localStorage.getItem('groceryItems');
        if (storedItems) {
            groceryItems = JSON.parse(storedItems);
            console.log('Loaded items:', groceryItems);
        }
    } catch (e) {
        console.error('Error loading items from localStorage:', e);
        groceryItems = [];
    }
}

// DOM Elements
const itemNameInput = document.getElementById('itemName');
const itemCategoryInput = document.getElementById('itemCategory');
const groceryList = document.getElementById('groceryList');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');

// Initialize the app
function init() {
    console.log('Initializing app...');
    loadItems();
    renderGroceryList();
    updateCategoryFilter();
    
    // Add event listeners
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && (document.activeElement === itemNameInput || document.activeElement === itemCategoryInput)) {
            addItem();
        }
    });
    
    console.log('App initialized');
}

// Add a new grocery item
function addItem() {
    console.log('Adding new item...');
    const name = itemNameInput.value.trim();
    const category = itemCategoryInput.value.trim();
    
    if (name && category) {
        const newItem = {
            id: Date.now(),
            name: name,
            category: category,
            date: new Date()
        };
        
        console.log('New item:', newItem);
        groceryItems.push(newItem);
        console.log('All items after add:', groceryItems);
        
        saveItems();
        
        // Show success toast
        showToast(`Added ${name} to your list`, 'success');
        
        // Clear inputs
        itemNameInput.value = '';
        itemCategoryInput.value = '';
        itemNameInput.focus();
        
        // Update the UI with animation
        updateCategoryFilter();
        renderGroceryList();
        
        // Add pop animation to the new item
        setTimeout(() => {
            const items = document.querySelectorAll('.grocery-item');
            if (items.length > 0) {
                const newItemElement = items[items.length - 1];
                newItemElement.classList.add('added');
                setTimeout(() => newItemElement.classList.remove('added'), 300);
            }
        }, 100);
    } else {
        showToast('Please enter both item name and category', 'warning');
    }
}

// Delete an item
function deleteItem(id) {
    console.log('Deleting item with ID:', id);
    const itemElement = document.querySelector(`[data-id="${id}"]`);
    const index = groceryItems.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const deletedItem = groceryItems[index];
        
        // Add removal animation
        if (itemElement) {
            itemElement.classList.add('removed');
            // Wait for animation to complete before removing
            setTimeout(() => {
                groceryItems.splice(index, 1);
                saveItems();
                renderGroceryList();
                showToast(`Removed ${deletedItem.name}`, 'error');
            }, 300);
        } else {
            groceryItems.splice(index, 1);
            saveItems();
            renderGroceryList();
            showToast(`Removed ${deletedItem.name}`, 'error');
        }
        
        console.log('Item deleted. Remaining items:', groceryItems);
    }
}

// Save items to localStorage
function saveItems() {
    try {
        console.log('Saving items:', groceryItems);
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Update the category filter dropdown
function updateCategoryFilter() {
    // Get all unique categories
    categories = new Set(groceryItems.map(item => item.category));
    
    // Save the current selected category
    const selectedCategory = filterCategory.value;
    
    // Clear and rebuild the category filter
    filterCategory.innerHTML = '<option value="all">All Categories</option>';
    
    // Add each category as an option
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategory.appendChild(option);
    });
    
    // Restore the selected category if it still exists
    if (selectedCategory && Array.from(categories).includes(selectedCategory)) {
        filterCategory.value = selectedCategory;
    }
}

// Sort items based on selected criteria
function sortItems() {
    const sortValue = sortBy.value;
    
    groceryItems.sort((a, b) => {
        switch(sortValue) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            default:
                return 0;
        }
    });
    
    renderGroceryList();
}

// Filter items based on selected category
function filterItems() {
    renderGroceryList();
}

// Render the grocery list
function renderGroceryList() {
    console.log('Rendering grocery list...');
    const filteredItems = getFilteredItems();
    const sortedItems = sortItems(filteredItems, sortBy.value);
    
    if (sortedItems.length === 0) {
        groceryList.innerHTML = `
            <div class="empty-message floating">
                <div>🛒</div>
                <p>Your grocery list is empty.<br>Add some items to get started!</p>
            </div>`;
        return;
    }
    
    // Add staggered animation delay
    groceryList.innerHTML = `
        <div class="grocery-list">
            ${sortedItems.map((item, index) => {
                const delay = Math.min(index * 50, 300); // Max 300ms delay
                return `
                <div class="grocery-item" 
                     data-id="${item.id}" 
                     style="animation-delay: ${delay}ms">
                    <div class="item-content">
                        <div class="item-icon">${getCategoryEmoji(item.category)}</div>
                        <div class="item-details">
                            <strong>${item.name}</strong>
                            <div class="item-meta">
                                <span class="category-badge">${item.category}</span>
                                <small>${formatDate(item.date)}</small>
                            </div>
                        </div>
                    </div>
                    <button onclick="deleteItem(${item.id})" 
                            class="delete-btn"
                            aria-label="Delete ${item.name}"
                            data-tooltip="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`;
            }).join('')}
        </div>`;
    
    // Add hover effects after rendering
    addHoverEffects();
    console.log('Grocery list rendered');
}

// Helper function to get emoji for category
function getCategoryEmoji(category) {
    const emojiMap = {
        'fruits': '🍎',
        'vegetables': '🥦',
        'dairy': '🥛',
        'meat': '🍗',
        'bakery': '🥖',
        'beverages': '🥤',
        'snacks': '🍪',
        'frozen': '❄️',
        'canned': '🥫',
        'spices': '🌶️',
        'deli': '🥓',
        'household': '🧴',
        'other': '📦'
    };
    
    const lowerCategory = category.toLowerCase();
    return emojiMap[lowerCategory] || '🛒';
}

// Add hover effects to items
function addHoverEffects() {
    const items = document.querySelectorAll('.grocery-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(5px)';
            item.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
            item.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
        });
    });
}

// Helper function to get filtered items
function getFilteredItems() {
    const selectedCategory = filterCategory.value;
    
    // Filter items by category if needed
    let filteredItems = [...groceryItems];
    if (selectedCategory !== 'all') {
        filteredItems = groceryItems.filter(item => item.category === selectedCategory);
    }
    
    return filteredItems;
}

// Helper function to sort items
function sortItems(items, sortValue) {
    switch(sortValue) {
        case 'name':
            return items.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return items.sort((a, b) => b.name.localeCompare(a.name));
        case 'date':
            return items.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return items.sort((a, b) => new Date(a.date) - new Date(b.date));
        default:
            return items;
    }
}

// Helper function to format date
function formatDate(date) {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Also try to initialize immediately in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
}

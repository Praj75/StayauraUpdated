/**
 * Flash Message System
 * A robust implementation for showing flash messages in the application
 */

// Flash Message Function
function showFlashMessage(message, type = 'info', duration = 3000) {
    let flashContainer = document.getElementById('flash-container');
    
    // Create flash container if it doesn't exist
    if (!flashContainer) {
        flashContainer = document.createElement('div');
        flashContainer.id = 'flash-container';
        document.body.appendChild(flashContainer);
    }
    
    // Check if there's already a flash message being displayed
    const existingFlash = document.querySelector('.flash-message.show');
    if (existingFlash) {
        // If there's an existing flash message, hide it first
        hideFlashMessage(existingFlash);
        // Wait for the animation to complete before showing the new message
        setTimeout(() => {
            createFlashMessage(message, type, duration);
        }, 500);
    } else {
        // If no existing flash message, create a new one immediately
        createFlashMessage(message, type, duration);
    }
}

function createFlashMessage(message, type, duration) {
    const flashContainer = document.getElementById('flash-container');
    
    // Create flash message element
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'delete') icon = 'trash-alt';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error') icon = 'exclamation-circle';
    
    // Set content
    flashMessage.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="close-btn"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    flashContainer.appendChild(flashMessage);
    
    // Show with animation
    setTimeout(() => {
        flashMessage.classList.add('show');
    }, 10);
    
    // Add close button functionality
    const closeBtn = flashMessage.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        hideFlashMessage(flashMessage);
    });
    
    // Auto hide after duration
    if (duration > 0) {
        setTimeout(() => {
            hideFlashMessage(flashMessage);
        }, duration);
    }
    
    return flashMessage;
}

function hideFlashMessage(flashMessage) {
    if (!flashMessage) return;
    
    flashMessage.classList.remove('show');
    flashMessage.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (flashMessage && flashMessage.parentNode) {
            flashMessage.parentNode.removeChild(flashMessage);
        }
    }, 500);
}

// Add CSS for flash messages
document.addEventListener('DOMContentLoaded', function() {
    // Create style element if it doesn't exist
    if (!document.getElementById('flash-styles')) {
        const style = document.createElement('style');
        style.id = 'flash-styles';
        style.textContent = `
            #flash-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .flash-message {
                position: relative;
                padding: 15px 25px;
                border-radius: 8px;
                background: linear-gradient(135deg, #FF385C, #E31C5F);
                color: white;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(255, 56, 92, 0.3);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateX(150%);
                transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                max-width: 350px;
                margin-bottom: 10px;
            }
            
            .flash-message.show {
                transform: translateX(0);
            }
            
            .flash-message i {
                font-size: 1.2rem;
            }
            
            .flash-message .close-btn {
                margin-left: auto;
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1rem;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            
            .flash-message .close-btn:hover {
                opacity: 1;
            }
            
            .flash-message.delete {
                background: linear-gradient(135deg, #dc3545, #c82333);
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            }
            
            .flash-message.success {
                background: linear-gradient(135deg, #28a745, #218838);
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            }
            
            .flash-message.warning {
                background: linear-gradient(135deg, #ffc107, #d39e00);
                box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
            }
            
            .flash-message.info {
                background: linear-gradient(135deg, #17a2b8, #138496);
                box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
            }
            
            .flash-message.error {
                background: linear-gradient(135deg, #dc3545, #c82333);
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            }
            
            .flash-message.hide {
                transform: translateX(150%);
            }
        `;
        document.head.appendChild(style);
    }
}); 
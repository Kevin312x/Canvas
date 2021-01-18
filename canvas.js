// Get canvas element and context
const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');
let ctx_rect= ctx.canvas.getBoundingClientRect();

// Create a dummy canvas to save canvas state
const canvas_memory = document.createElement('canvas');
const ctx_memory = canvas_memory.getContext('2d');

// Get element and hex value of color
const color_picker = document.querySelector('.color-picker');
let color_selected = color_picker.value;

window.addEventListener('load', (e) => {
    let draw_flag = false;

    // Set default width
    canvas.style.width ='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = 500;

    // Event listener functions
    const mousedown_event = (e) => {
        draw_flag = true;
        ctx.beginPath();
        draw(e); // Draws a dot on mouse click down
    }

    const draw = (e) => {
        // If mouse up, don't draw
        if(!draw_flag) { return; }

        // Set stroke sizes and color
        ctx.strokeStyle = color_selected;
        ctx.lineWidth = brush_size;
        ctx.lineCap = 'round';

        // Draw
        ctx.lineTo(e.clientX - ctx_rect.left, e.clientY - ctx_rect.top);
        ctx.stroke();
    }

    const mouseup_event = () => {
        draw_flag = false; // Turn of flag
    }

    // Add event listeners
    canvas.addEventListener('mousedown', mousedown_event);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', mouseup_event);
});

window.addEventListener('resize', () => {
    // Save canvas state into canvas memory (dimensions and drawing) 
    canvas_memory.height = canvas.height;
    canvas_memory.width = canvas.width;
    ctx_memory.drawImage(canvas, 0, 0);

    // Resize and restore canvas from canvas memory
    canvas.style.width ='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = 500;
    ctx.drawImage(canvas_memory, 0, 0);
    ctx_rect= ctx.canvas.getBoundingClientRect();
});

color_picker.addEventListener('change', (e) => {
    color_selected = e.target.value;
});

// Get brush size elements
const brush_size_decr_ele = document.querySelector('#decrease-brush-size');
const brush_size_incr_ele = document.querySelector('#increase-brush-size');
const brush_size_ele = document.querySelector('.brush-size');
let brush_size = parseInt(brush_size_ele.value);

// Decrease and display brush size
brush_size_decr_ele.addEventListener('click', () => {
    brush_size -= 1;
    brush_size_ele.value = brush_size;
});

// Increase and display brush size
brush_size_incr_ele.addEventListener('click', () => {
    brush_size += 1;
    brush_size_ele.value = brush_size;
});

// Modify brush size from display
brush_size_ele.addEventListener('change', (e) => {
    brush_size = e.target.value;
});

// Simple example, see optional options for more configuration.
const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'classic', // or 'monolith', or 'nano'
    default: '#000000',

    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
    ],

    components: {

        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            hex: true,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true
        }
    }
});

pickr.on('change', (color, instance) => {
    color_selected = color.toHEXA().toString()
});
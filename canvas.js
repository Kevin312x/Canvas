// Get canvas element and context
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
let ctx_rect= ctx.canvas.getBoundingClientRect();

// Create a dummy canvas to save canvas state
const canvas_memory = document.createElement('canvas');
const ctx_memory = canvas_memory.getContext('2d');

// Get element and hex value of color
const color_picker = document.querySelector('#color-picker');
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
const brush_size_ele = document.querySelector('#brush-size');
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
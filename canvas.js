// Get canvas element and context
const canvas = document.querySelector('.canvas');
const ctx    = canvas.getContext('2d');
let ctx_rect = ctx.canvas.getBoundingClientRect();

// Create a dummy canvas to save canvas state
const canvas_memory = document.createElement('canvas');
const ctx_memory    = canvas_memory.getContext('2d');

const socket  = io();
// Socket event listeners
socket.on('begin_path', () => { ctx.beginPath(); }); // On mousedown. begin path
socket.on('point', (data)  => { draw(null, data.x, data.y, data.marker, data.color, data.size, data.rgba); }); // On mousemove, start drawing
socket.on('req_data', (data) => { // Sends canvas image and array of messages
    let all_messages = [];
    document.querySelectorAll('.messages > li').forEach(message => {
        all_messages.push(message.innerHTML);
    });

    socket.emit('data', 
    {
        'canvas': canvas.toDataURL(), 
        'messages': all_messages, 
        'target_id': data.sender_id}); 
    }
);
socket.on('res_data', (data) => { // Loads image onto canvas and inserts messages into chatbox
    let image = new Image();
    image.onload = () => { ctx.drawImage(image, 0, 0); }
    image.src = data.canvas;

    data.messages.forEach(message => {
        const msg = document.createElement('li');
        msg.innerHTML = message;
        messages.appendChild(msg);
        messages.scrollIntoView(false);
    })
});
socket.on('rec_msg', (data) => { // Insert received message into chatbox
    const msg = document.createElement('li');
    msg.innerHTML = `<b>${data.sender}</b>: ${data.msg}`;
    messages.appendChild(msg);
    messages.scrollIntoView(false);
});

// Default marker to pen
let marker = 'pen'; // Can be 'pen', 'eraser', or 'fill'
let draw_flag = false;

// Set default width
canvas.style.width ='100%';
canvas.width       = canvas.offsetWidth;
canvas.height      = 500;

// Event listener functions
const mousedown_event = (event) => {
    ctx.beginPath();
    draw_flag = true;
    socket.emit('start');
    mousemove_event(event); // Draws a dot on mouse click down
}

const mousemove_event = (event) => {
    // If mouse up, don't draw
    if(!draw_flag) { return; }
    draw(event);
    socket.emit('draw', {
        'x'     : event.clientX - ctx_rect.left, 
        'y'     : event.clientY - ctx_rect.top, 
        'size'  : brush_size,
        'color' : color_selected,
        'marker': marker,
        'rgba'  : color_rgba
    });
}

const mouseup_event = () => {
    draw_flag = false; // Turn off flag
}

// Draw
const draw = (event, x = null, y = null, marker_tool = marker, color = color_selected, size = brush_size, rgba = color_rgba) => {
    let mouse_x     = x || event.clientX - ctx_rect.left;
    let mouse_y     = y || event.clientY - ctx_rect.top;

    // Set line info
    ctx.lineWidth   = size;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';

    switch(marker_tool) {
        case 'pen':
            ctx.lineTo(mouse_x, mouse_y);
            ctx.stroke();
            break;
        case 'eraser':
            ctx.strokeStyle = 'white';
            ctx.lineTo(mouse_x, mouse_y);
            ctx.stroke();
            break;
            case 'fill':
                // Refer to http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
                flood_fill(Math.ceil(mouse_x), Math.ceil(mouse_y), rgba);
            break;
        default:
            // Defaults to 'pen'
            marker = 'pen';
            break;
    }
}

// Add event listeners
canvas.addEventListener('mousedown', mousedown_event);
canvas.addEventListener('mousemove', mousemove_event);
canvas.addEventListener('mouseup', mouseup_event);

// Event Listener to modify canvas on resize
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
brush_size_ele.addEventListener('change', (event) => {
    brush_size = event.target.value;
});

// Get element and hex value of color
const color_picker = document.querySelector('.color-picker');
let color_selected = color_picker.value || '#000000';
let color_rgba     = 'rgba(0, 0, 0, 1)';

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

// Event Listener to modify color_selected and color_rgba variables
pickr.on('change', (color, instance) => {
    color_selected = color.toHEXA().toString();
    color_rgba = color.toRGBA().toString();
});

/**
 * Checks and matches the rgba of the start_color and the pixel at image_data[position]
 * @param image_data: array containing all the rgba of pixels on canvas
 * @param position: position of pixel on image data
 * @param start_color: rgba object
 * @returns: True or False depending on whether the color at the position matches the start_color
 */
function match_start_color(image_data, position, start_color) {
    let current_color = {
        'r': image_data[position],
        'g': image_data[position + 1],
        'b': image_data[position + 2],
        'a': image_data[position + 3]
    }
    return (current_color.r === start_color.r &&
            current_color.b === start_color.b &&
            current_color.g === start_color.g &&
            current_color.a === start_color.a)
}

/**
 * Set the rgba at data[position] equal to color
 * @param data: array containing all the rgba of pixels on canvas
 * @param position: position of pixel on image data
 * @param color: rgba object
 * @returns: none
 */
function color_pixel(data, position, color) {
    let rgba = color.substring(5, color.length - 1).split(',').map(str => str.trim());
    data[position] = parseInt(rgba[0]) || 0;
    data[position + 1] = parseInt(rgba[1]) || 0;
    data[position + 2] = parseInt(rgba[2]) || 0;
    data[position + 3] = parseInt(rgba[3]) * 255 || 255;
}

/**
 * @param x_pos: X mouse position relative to canvas
 * @param y_pos: Y mouse position relative to canvas
 * @param color: Color to fill
 * @returns: none
 * Detects all surrounding similarly colored pixel at (x_pos, y_pos) and colors them with the given color
 */
function flood_fill(x_pos, y_pos, color) {
    // Convert canvas to image data
    let img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = img_data.data;
    // Gets position of clicked pixel
    let position = (y_pos * canvas.width + x_pos) * 4;
    // Get the RGBA of pixel
    const start_color = {
        'r': data[position],
        'g': data[position + 1],
        'b': data[position + 2],
        'a': data[position + 3]
    }

    /**
     * Loop to color in matching pixels
     * Color in from top to bottom while checking left and right columns for same colored pixels
     * If so, position add to stack
     */
    let pixel_stack = [[x_pos, y_pos]];
    while(pixel_stack.length) {
        let new_coordinates = pixel_stack.pop();
        let x = new_coordinates[0];
        let y = new_coordinates[1];

        let new_pos = (y * canvas.width + x) * 4;
        while((y-- >= 0) && match_start_color(data, new_pos, start_color)) {
            new_pos -= canvas.width * 4;
        }

        ++y;
        new_pos +=canvas.width * 4;
        let reach_right = false;
        let reach_left = false;

        while((y++ < canvas.height-1) && match_start_color(data, new_pos, start_color)) {
            color_pixel(data, new_pos, color);

            if(x > 0) {
                if(match_start_color(data, new_pos - 4, start_color)) {
                    if(!reach_left) {
                        pixel_stack.push([x - 1, y]);
                        reach_left = true;
                    }
                } else if(reach_left) {
                    reach_left = false;
                }
            }

            if(x < canvas.width - 1) {
                if(match_start_color(data, new_pos + 4, start_color)) {
                    if(!reach_right) {
                        pixel_stack.push([x + 1, y]);
                        reach_right = true;
                    }
                } else if(reach_right) {
                    reach_right = false;
                }
            }
        new_pos += canvas.width * 4;
        }
    }
    // Put image data back onto canvas
    ctx.putImageData(img_data, 0, 0);
}

// Switch active class on buttons when clicked
const tool_buttons = document.querySelectorAll('.tools > button:not(:last-child)'); // Removes 'clear' button
tool_buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
        document.querySelector('.tools > .active').classList.remove('active');
        event.target.classList.add('active');
        canvas.classList = 'canvas';

        if(event.target.classList.value.includes('pen')) {
            marker = 'pen';
            canvas.classList.add('pen-cursor');
        } else if(event.target.classList.value.includes('eraser')) {
            marker = 'eraser';
            canvas.classList.add('eraser-cursor');
        } else if(event.target.classList.value.includes('fill')) {
            marker = 'fill';
            canvas.classList.add('fill-cursor');
        }
    });
});

// Simulate a button depression when clicking 'clear' button
const clear_button = document.querySelector('.clear');
clear_button.addEventListener('mousedown', (event) => { event.target.classList.add('active'); clear_canvas(); });
clear_button.addEventListener('mouseup', (event) => { event.target.classList.remove('active'); });
// Clears canvas
function clear_canvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

const send_btn   = document.querySelector('.send-msg');
const messages   = document.querySelector('.messages');
const input_msg  = document.querySelector('.msg-input');

send_btn.addEventListener('click', (event) => {
    socket.emit('send_msg', {'msg': input_msg.value});
    input_msg.value = '';
});
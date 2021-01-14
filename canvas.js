const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const ctx_rect= ctx.canvas.getBoundingClientRect();

const color_picker = document.querySelector('#color-picker');
let color_selected = color_picker.value;

window.addEventListener('load', (e) => {
    let draw_flag = false;

    canvas.style.width ='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = 500;

    const mousedown_event = (e) => {
        draw_flag = true;
        ctx.beginPath();
        draw(e);
    }

    const draw = (e) => {
        if(!draw_flag) { return; }
        ctx.strokeStyle = color_selected;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - ctx_rect.left, e.clientY - ctx_rect.top);
        ctx.stroke();
    }

    const mouseup_event = () => {
        draw_flag = false;
    }


    canvas.addEventListener('mousedown', mousedown_event);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', mouseup_event);
});

window.addEventListener('resize', () => {
    
});

color_picker.addEventListener('change', (e) => {
    color_selected = e.target.value;
})
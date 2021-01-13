window.addEventListener('load', (e) => {
    let draw_flag = false;
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = 500;
    canvas.width = 1500;
    const mousedown_event = (e) => {
        draw_flag = true;
        ctx.beginPath();
    }

    const draw = (e) => {
        if(!draw_flag) { return; }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
    }

    const mouseup_event = () => {
        draw_flag = false;
    }


    canvas.addEventListener('mousedown', mousedown_event);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', mouseup_event);
});
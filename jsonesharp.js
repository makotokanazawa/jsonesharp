//
// status and message lines
//

var status_text = function(text) {

    $('#status').text(text);
};

var message_text = function(text) {

    $('#message').text(text);
};

var ready_message = function() {
    
    status_text("a 1# interpreter for web browsers (type '?' for help)");
    message_text("ready");
}

var halting_message = function(n, p) {

    if (n == p.length) {
	   status_text("halted properly");
       message_text("ready");
    }
    else {
	   status_text("halted improperly");
       message_text("ready");
    };
};

var halting_message_steps = function(n, p, m) {

    if (n == p.length) {
//	status_text("halted properly after ".concat(String(m)," steps"));
        status_text("halted properly");
        message_text("halted properly after ".concat(String(m)," steps"));
    }
    else {
//	status_text("halted improperly after ".concat(String(m)," steps"));
        status_text("halted properly");
        message_text("halted improperly after ".concat(String(m)," steps"));
    };
};

var running_message = function(n, p, m) {

//    status_text("executed ".concat(String(m)," steps; next instruction is ", String(n), ": ", "1".repeat(p[n][0]), '#'.repeat(p[n][1])));
    status_text("running..."); // uncommenting this makes the "running..." message not disappear
    if (n < p.length) {
        message_text("executed ".concat(String(m)," steps; next instruction is ", String(n+1), ": ", "1".repeat(p[n][0]), '#'.repeat(p[n][1])));
    };
}

var eval_message = function() {

    status_text("running...");
    message_text("running...");
};

var interrupt_message = function() {

    status_text("execution interrupted");
    message_text("interrupted");
};

var timeout_message = function() {
    status_text("timeout: execution aborted");
    message_text("aborted");
}

var pause_message = function() {

    status_text("paused");
}

//
// DOM register management routines
//

var resize_text_area = function(e) {

    e.css('height', 'auto');
    var h = (e.prop('scrollHeight') + 2).toString().concat('px');
    e.css('height', h);
};

var new_register = function(n) {

    var id = 'register_'.concat(n.toString());
    var grp_id = 'form_group_'.concat(id);
    
    var grp = $('<div>');
    grp.attr('class', 'form-group');
    grp.attr('id', grp_id);
    
    var col2 = $('<div>');
    col2.attr('class', 'col-sm-9');

    var col3 = $('<div>');
    col3.attr('class', 'col-sm-2');

    var textarea = $('<textarea>');
    textarea.attr('class', 'form-control register');
    textarea.attr('rows', '1');
    textarea.attr('id', id);
    textarea.attr('tabindex', n + 1);
    
    var label = $('<label>');
    label.attr('class', 'control_label col-sm-1');
    label.attr('for', id);
    label.html('R'.concat(n.toString()));

    var button = $('<button>');
    button.attr('type', 'button');
    button.attr('class', 'btn btn-default clear_register');
    button.html('clear');
    button.click(function () {
	var e = $('#'.concat(id)); 
	e.val('');
	resize_text_area(e);
    });
    
    col2.append(textarea);
    col3.append(button);
    grp.append(label);
    grp.append(col2);
    grp.append(col3);

    return grp;
};

var update_register_buttons = function(m) {

    $('#add_register').html('add R'.concat(m.toString()));
    $('#remove_register').html('remove R'.concat((m-1).toString()));
    if (m==2) {
	// Disable remove register button when there's only one register
	    $('#remove_register').prop("disabled", true);
    } else {
	    $('#remove_register').prop("disabled", false);
    };
};

var extend_registers = function(n) {

    var m = $('.register').length + 1;

    while (m <= n) {
    	$('#rm').append(new_register(m));
    	m++;
    }

    update_register_buttons(m);
};

var add_one_register = function() {

    extend_registers($('.register').length + 1);
};

var remove_last_register = function() {

    var m = $('.register').length;

    if (m > 1) {
//	    var sel = '#'.concat('form_group_register_'.concat(m.toString()));
        var e = $('#form_group_register_'.concat(m.toString()));
//	    $(sel).remove();
        e.remove();
	    update_register_buttons(m);
    };
};

//
// functions for copying registers stored in an array (starting at
// index 1) to DOM and back.
//

var dom_regs_to_array = function() {

    var dom_regs = $('.register');
    var regs = [[]]; // the first element of the array is not used

    var id = '';
    var i = 1;
    while (i <= dom_regs.length) {
    	id = '#register_'.concat(i.toString());
    	regs.push($(id).val().split(''));
    	i++;
    }
    
    return regs;
};

var array_to_dom_regs = function(regs) {

    var m = $('.register').length;
    
    if (regs.length < m+1) {
    	while (regs.length < m+1) {
    	    remove_last_register();
    	    m--;
    	}
    } else {
	    extend_registers(regs.length-1);
    };

    var id = '';
    var i = 1;

    while (i < regs.length) {
	    id = '#register_'.concat(i.toString()); 
	    $(id).val(regs[i].join(''));
	    resize_text_area($(id));
	    i++;
    };
};

//
// Program preprocessing routines
//
var parse_program = function() {

    var p = $('#program').val();
    p = clean(p);
    var parsed = parse(p);
    if (parsed[0] < p.length) {
    	status_text('syntax error');
    	eval_button_ready();
    	return [false, parsed[1]];
    };
    return [true, parsed[1]];
};

//
// Button events and states
//

var clear_program = function() {

    $('#program').val('');
};

var pos = 0;
var halted = false;
var n_steps = 0;
var saved_regs = [[]];

var button_ready = function() {

    $('#clear_program').prop('disabled', false);
    $('#add_register').prop('disabled', false);
    if ($('.register').length > 1) {
        $('#remove_register').prop('disabled', false);
    } else {
        $('#remove_register').prop('disabled', true);
    }
    $('#evaluate').prop('disabled', false);
    $('#interrupt').prop('disabled', true);
    $('#interrupt').off('click'); // not necessary?
    $('#eval_slow').prop('disabled', false);
    $('#pause').prop('disabled', true);
    $('#eval_step').prop('disabled', false);
    $('#back').prop('disabled', true);
    $('#reset_machine').prop('disabled', false);
    $('#open').prop('disabled', false);
//    $('#save-modal').prop('disabled', false);

    $('#program').prop('readonly', false);
}

var button_busy = function() {

    $('#clear_program').prop('disabled', true);
    $('#add_register').prop('disabled', true);
    $('#remove_register').prop('disabled', true);
    $('#evaluate').prop('disabled', true);
    $('#interrupt').prop('disabled', false);
    $('#eval_slow').prop('disabled', true);
    $('#pause').prop('disabled', true);
    $('#eval_step').prop('disabled', true);
    $('#back').prop('disabled', true);
    $('#reset_machine').prop('disabled', true);
    $('#open').prop('disabled', true);
//    $('#save-modal').prop('disabled', false);

    $('#program').prop('readonly', true);
}

var button_running = function() {

    $('#clear_program').prop('disabled', true);
    $('#add_register').prop('disabled', true);
    $('#remove_register').prop('disabled', true);
    $('#evaluate').prop('disabled', true);
    $('#interrupt').prop('disabled', true);
    $('#interrupt').off('click');
    $('#eval_slow').prop('disabled', true);
    $('#pause').prop('disabled', false);
    $('#eval_step').prop('disabled', true);
    $('#back').prop('disabled', true);
    $('#reset_machine').prop('disabled', true);
    $('#open').prop('disabled', true);
//    $('#save-modal').prop('disabled', false);

    $('#program').prop('readonly', true);
}

var button_paused = function() {

    $('#clear_program').prop('disabled', true);
    $('#add_register').prop('disabled', true);
    $('#remove_register').prop('disabled', true);
    $('#evaluate').prop('disabled', true);
    if (halted) {
        $('#eval_slow').prop('disabled', true);
        $('#eval_step').prop('disabled', true);
    } else {
        $('#eval_slow').prop('disabled', false);
        $('#eval_step').prop('disabled', false);
    }
    $('#interrupt').prop('disabled', true);
    $('#interrupt').off('click');
    $('#pause').prop('disabled', true);
    if (n_steps == 0) {
        $('#back').prop('disabled', true);
    } else {
        $('#back').prop('disabled', false);
    }
    $('#reset_machine').prop('disabled', false);
    $('#open').prop('disabled', true);
//    $('#save-modal').prop('disabled', false);

    $('#program').prop('readonly', true);
}

/*
var eval_button_ready = function() {

    $('#interrupt').prop('disabled', true);
    $('#interrupt').off('click');
    $('#evaluate').prop('disabled', false);
    $('#pause').prop('disabled', true);
    $('#eval_slow').prop('disabled', false);
    $('#eval_step').prop('disabled', false);
    $('#back').prop('disabled', true);
    $('#reset_machine').prop('disabled', false);
};

var eval_button_busy = function() {

    $('#interrupt').prop('disabled', false);
    $('#evaluate').prop('disabled', true);
    $('#eval_slow').prop('disabled', true);
    $('#eval_step').prop('disabled', true);
    $('#reset_machine').prop('disabled', true);
};
*/

var reset_machine = function() {
    pos = 0;
    halted = false;
    n_steps = 0;

    array_to_dom_regs(saved_regs);

    button_ready();
//    eval_button_ready();
//    textarea_ready();
//    $('#eval_step').prop('disabled', false);
    ready_message();
//    status_text("a 1# interpreter for web browsers (type '?' for help)");
//    message_text("ready");
}

/*
var textarea_ready = function() {

    $('#clear_program').prop('disabled', false);
    $('#program').prop('readonly', false);
};

var textarea_busy = function() {

    $('#clear_program').prop('disabled', true);
    $('#program').prop('readonly', true);
}
*/

var evaluate = function() {

    if (halted) return;
    if (pos != 0) return;
    
    // Parse program
//    var p = vernacular_compile($('#program').val());
    var parsed = parse_program();
    if (parsed[0]) {
    	var p = parsed[1];
    }
    else {
	   return;
    }

    if (p.length == 0) return;

    button_busy();
//    eval_button_busy();
//    textarea_busy();
    eval_message();
    
    // Move dom registers to array
    var regs = dom_regs_to_array();

    saved_regs = dom_regs_to_array();

    // Start worker and make kill button active
    var thread = new Worker('evaluate.js');
    $('#interrupt').click(function() {
    	thread.terminate();
        interrupt_message();
        halted = true;
//    	eval_button_ready();
        $('#interrupt').prop('disabled', true);
        $('#interrupt').off('click');
        $('#reset_machine').prop('disabled', false);
    });

    var timeoutID = setTimeout(function() {
        thread.terminate();
        timeout_message();
        halted = true;
        $('#interrupt').prop('disabled', true);
        $('#interrupt').off('click'); // not necessary?
        $('#reset_machine').prop('disabled', false);
    }, 
    2000);
    
    thread.onmessage = function(e) {

        clearTimeout(timeoutID);
    	halting_message(e.data[0], p);
        array_to_dom_regs(e.data[1]);
//        halted = true;
        halted = false;
        button_ready();
//        eval_button_ready();
//        textarea_ready();
//        $('#interrupt').prop('disabled', true);
//        $('#reset_machine').prop('disabled', false);
    };

    thread.postMessage([p, regs]);
};

var eval_slow = function() {

    if (halted) return;
    
    // Parse program
//    var p = vernacular_compile($('#program').val());
    var parsed = parse_program();
    if (parsed[0]) {
    	var p = parsed[1];
    }
    else {
	   return;
    };

    if (p.length == 0) return;

    button_running();
//    eval_button_busy();
//    textarea_busy();
//    $('#pause').prop('disabled', false);
    eval_message();
    
    if (n_steps == 0) running_message(pos, p, n_steps);

    // Move dom registers to array
    var regs = dom_regs_to_array();

    if (n_steps == 0) saved_regs = dom_regs_to_array();

    var interval = document.getElementById("speed").value;

    // Start worker and make pause button active
    var thread = new Worker('eval-slow.js');
    $('#pause').click(function() {

    	thread.terminate();
        pause_message();
        button_paused();
//    	eval_button_ready();
//        $('#pause').prop('disabled', true);
//        $('#eval_slow').prop('disabled', false);
//        $('#eval_step').prop('disabled', false);
//        $('#reset_machine').prop('disabled', false);
    });
    thread.onmessage = function(e) {

        array_to_dom_regs(e.data[1]);
        n_steps = e.data[3];
        pos = e.data[0];
        if (e.data[2]) {
            halted = true;
            button_paused();
            halting_message_steps(pos, p, n_steps);
//    	    eval_button_ready();
//            $('#pause').prop('disabled', true);
//            $('#reset_machine').prop('disabled', false);
//            if (n_steps > 0) $('#back').prop('disabled', false);
    	} else {
//            array_to_dom_regs(e.data[1]);
            running_message(pos, p, n_steps);
        };
    };
    thread.postMessage([p, regs, pos, n_steps, interval]);
};

var eval_step = function() {

    if (halted) return;

    // Parse program
//    var p = vernacular_compile($('#program').val());
    var parsed = parse_program();
    if (parsed[0]) {
        var p = parsed[1];
    } else {
        return;
    };

    if (p.length == 0) return;

    button_busy(); // not necessary?
//    eval_button_busy();
//    textarea_busy();
//    $('#interrupt').prop('disabled', true);
//    $('#pause').prop('disabled', true);
    eval_message(); // not necessary?
    
    // Move dom registers to array
    var regs = dom_regs_to_array();

    if (n_steps == 0) saved_regs = dom_regs_to_array();

    if (pos < 0 || p.length <= pos) return;

    pos = step(p, pos, regs);
    n_steps++;
    if (n_steps > 0) $('#back').prop('disabled', false);
    if (pos < 0 || p.length <= pos) {
        halting_message_steps(pos, p, n_steps);
//        $('#eval_step').prop('disabled', true);
	    halted = true;
    } else {
//	    status_text('executed '.concat(String(n_steps),' steps'));
        running_message(pos, p, n_steps);
        pause_message();
    };

    array_to_dom_regs(regs);

    button_paused();
/*
    if (!halted) {
//      eval_button_ready();
        $('#interrupt').prop('disabled', true);
        $('#eval_step').prop('disabled', false);
        $('#eval_slow').prop('disabled', false);
        pause_message();
    };
    $('#reset_machine').prop('disabled', false);
*/
};

var back = function() {
    // Parse program
//    var p = vernacular_compile($('#program').val());
    var parsed = parse_program();
    if (parsed[0]) {
        var p = parsed[1];
    } else {
        return;
    };

    if (p.length == 0 || n_steps == 0) return;

    button_busy();
//    message_text("running...");
//    eval_button_busy();
//    textarea_busy();
//    $('#interrupt').prop('disabled', false);
    eval_message();

    // Start worker and make kill button active
    var thread = new Worker('eval-for.js');
    $('#interrupt').click(function() {
        thread.terminate();
        interrupt_message();
        halted = true;
    //  eval_button_ready();
        $('#interrupt').prop('disabled', true);
        $('#interrupt').off('click');
        $('#reset_machine').prop('disabled', false);
    });

    var timeoutID = setTimeout(function() {
        thread.terminate();
        timeout_message();
        halted = true;
        $('#interrupt').prop('disabled', true);
        $('#interrupt').off('click'); // not necessary?
        $('#reset_machine').prop('disabled', false);
    }, 
    2000);    

    thread.onmessage = function(e) {

        clearTimeout(timeoutID);
        array_to_dom_regs(e.data[1]);
        pos = e.data[0];
        n_steps = e.data[3];
        if (e.data[2]) {
            halting_message_steps(pos, p, n_steps);
            halted = true;
            //  eval_button_ready();
        } else {
            running_message(pos, p, n_steps);
            halted = false;
            pause_message();
        };

        button_paused();
    };

    n_steps--;
    thread.postMessage([p, saved_regs, 0, n_steps]);
};

var load_program = function() {
    var text = $(this).siblings("p.program-text").text().trim();
    $("#program").val(text);
    $("#editor-tab").click();
};

var add_workshop_page = function(title, program_text, active, tabpanel_id) {
    // find the workshop's stacked nav
    var ul = $("#" + tabpanel_id + " ul.nav-tabs");
    var num_page = ul.children().length + 1;

    // find a title
    if (title == null) title = "program " + num_page.toString();
    var id = tabpanel_id + '-p' + num_page.toString();

    // format the program text
    program_text = program_text.replace(/(?:\r\n|\r|\n)/g, '\n<br>');
    program_text = program_text.replace(/#1/g, '# 1');

    // make a new li to add to the navigation
    var new_li = $('<li>');
    new_li.attr('role', 'presentation');
    if (active) new_li.attr('class', 'active');

    var new_tab = $('<a>');
    new_tab.attr('href', '#' + id);
    new_tab.attr('role', 'tab');
    new_tab.attr('data-toggle', 'tab');
    new_tab.text(title);

    new_li.append(new_tab);
    ul.append(new_li);

    // add a new div with the program text and a load button
    var tab_content = $("#" + tabpanel_id + " div.tab-content");

    var new_panel = $('<div>');
    new_panel.attr({'role': 'tabpanel', 'class': 'tab-pane', 'id': id});
    if (active) new_panel.attr('class', 'tab-pane active');

    var new_p = $('<p>');
    new_p.attr('class', 'program-text');
    new_p.html(program_text);
    new_panel.append(new_p);

    if (tabpanel_id == 'workshop') {
        var new_button = $('<a>');
        new_button.attr({'class': 'btn btn-primary wk-pload', 'type': 'button', 
            'role': 'button', 'data-toggle': 'tooltip', 'title': 'l'});
        new_button.text('load into editor');
        new_button.click(load_program);
        new_button.tooltip();
        new_panel.append(new_button);
    } else if (tabpanel_id == 'save-modal-panel') {
        var new_button = $('<a>');
        new_button.attr({'class': 'btn btn-primary save-over', 'type': 'button', 
            'role': 'button'});
        new_button.text('overwrite this');
        new_button.click(function () {
            var processed_text = $('#program').val();
            processed_text = processed_text.replace(/#1/g, '# 1');

            sudo_set_program(title, processed_text);
            clear_std_tabs();
            load_library_from_cookie();
            //$(this).siblings('p.program-text').html(processed_text);
            $('div.modal').modal('hide');
        });
        new_panel.append(new_button);
    } else if (tabpanel_id == 'open-modal-panel') {
        var new_button = $('<a>');
        new_button.attr({'class': 'btn btn-primary open', 'type': 'button', 
            'role': 'button'});
        new_button.text('open');
        new_button.click(function () {
            $('#program').val($(this).siblings('p.program-text').text());
            $('div.modal').modal('hide');
        });
        new_panel.append(new_button);
    };

    tab_content.append(new_panel);

    return title;
};

var replenish_std_lib = function() {
    sudo_set_program("clear1", "; clear 1\n1##### 111### 11#### 111####");
    sudo_set_program("pop1", "; pop 1\n1##### 1### 1###");
    sudo_set_program("copy123", "; copy 2 <- 1 using 3\n1##### 11111111### 1111### 11## 111## 11111#### 11# 111# 11111111#### 111##### 111111### 111### 1## 1111#### 1# 111111####");
    sudo_set_program("write", "; write\n1##### 111111111### 11111### 11# 11## 11## 111111#### 11# 11##\n111111111#### 11### ## 111111### 111### 1## 1111#### 1# 111111####");
    sudo_set_program("writelastclear", "; write last clear\n1## 1## 1## 1## 1## 1# 1# 1# 1## 1## 1## 1# 1# 1## 1## 1## 1## 1# 1# 1# 1## 1## 1## 1##");
    sudo_set_program("metaclear", "; metaclear\nimport copy123\nimport clear1\nlabel start\n11##### ; cases 2\ngoto end ; blank => goto end\n1### ; 1 => next instruction\n1# ; # => write a 1\ngoto start\nlabel end\nimport writelastclear");
}

var save_as_new = function() {
    var title = null;
    var program_text = $('#program').val();
    title = add_workshop_page(title, program_text, false, "workshop");
    add_workshop_page(title, program_text, false, "save-modal-panel");
    add_workshop_page(title, program_text, false, "open-modal-panel");
    sudo_set_program(title, program_text);
};

var clear_tabs = function(tabpanel_id) {
    $("#" + tabpanel_id + " ul.nav-tabs").empty();
    $("#" + tabpanel_id + " div.tab-content").empty();
}

var clear_std_tabs = function() {
    clear_tabs('workshop');
    clear_tabs('save-modal-panel');
    clear_tabs('open-modal-panel');
}

var load_library_from_cookie = function () {
    replenish_std_lib();

    var program_titles = get_titles();
    var first = true;
    for (var i = 0; i < program_titles.length; i++) {
        var program_vernacular = get_vernacular(program_titles[i]);
        add_workshop_page(program_titles[i], program_vernacular, first, "workshop");
        add_workshop_page(program_titles[i], program_vernacular, first, "save-modal-panel");
        add_workshop_page(program_titles[i], program_vernacular, first, "open-modal-panel");
        first = false;
    }
};

//
// main
//

$(document).ready(function() {
    // load cookie data
    load_library_from_cookie();

    // prep editor tab
    extend_registers(1);

    button_ready();
//    eval_button_ready();
//    textarea_ready();

    // click handlers
    $('#remove_register').click(remove_last_register);
    $('#add_register').click(add_one_register);
    $('#clear_program').click(clear_program);
    $('#evaluate').click(evaluate);
    $('#eval_slow').click(eval_slow);
    $('#eval_step').click(eval_step);
    $('#back').click(back);
    $('#reset_machine').click(reset_machine);
    $('a.wk-pload').click(load_program);
    $('#save_as_new').click(function () {
        $('#save-modal').modal('show');
    });
    $('#open').click(function () {
        $('#open-modal').modal('show');
    });
    $('#save_new_btn').click( function() {
        sudo_set_program($('#save_new_title').val(), $('#program').val());
        clear_std_tabs();
        load_library_from_cookie();
        $('div.modal').modal('hide');
    });

    $('[data-toggle="tooltip"]').tooltip({trigger: "hover"});
    $('[data-toggle="tooltip"]').click(function () {
        $('[data-toggle="tooltip"]').tooltip("hide");
    });

    // keyboard inputs
    $('body').keypress(function(e) {
        if (e.keyCode == 27) {
            $('div.modal').modal('hide');
            $('*').blur();
        };

        // intercept other keyboard inputs only if not in a text area
        if (!$('input,textarea').is(':focus')) {
            if (e.which == 63) { // '?'
                $("#help-modal").modal('show');
            };

            // these shortcuts are available for editor tab only
            if ($("li[class=active] > #editor-tab").length) {
                /*
                if (e.which == 99) { // 'c'
                    $('#clear_program').click();
                };
                */
                if (e.which == 111) { // 'o'
                    $('#open-modal').modal('show');
                };
                if (e.which == 114) { // 'r'
                    $('#eval_slow').click();
                };
                if (e.which == 115) { // 's'
                    $('#save-modal').modal('show');
                };
                if (e.which == 102) { // 'f'
                    $("#eval_step").click();
                };  
                if (e.which == 98) { // 'b'
                    $("#back").click();
                };  
                if (e.which == 118) { // 'v'
                    $('#evaluate').click();
                };
                if (e.which == 119) { // 'w'
                    $("#workshop-tab").click();
                };
            };

            // these shortcuts are available for workshop tab only
            if ($("li[class=active] > #workshop-tab").length) {
                if (e.which == 101) { // 'e'
                    $("#editor-tab").click();
                };
                if (e.which == 108) { // 'l'
                    $('#workshop div[class="tab-pane active"] a').click();
                };
            };
        };
    });
});

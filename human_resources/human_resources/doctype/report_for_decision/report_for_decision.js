// Copyright (c) 2022, John Park and contributors
// For license information, please see license.txt

frappe.ui.form.on('Report For Decision', {
	onload: function(frm,cdt, cdn) {

	//frm.doc["approval_line"].grid.add_custom_button(__("Do Something"), function() {
    //    alert("button");
    //});

    //frm.fields_dict["approval_line"].grid.add_custom_button(__('Hello'),
	//	function() {
	//	    frappe.msgprint(__("Hello"));
    //});
    //frm.fields_dict["approval_line"].grid.grid_buttons.find('.btn-custom').removeClass('btn-default').addClass('btn-primary');

    if(frm.doc.__islocal)
      frappe.model.clear_table(frm.doc, "approval_line");
	if(frm.is_new()){
        frappe.call({
                "method": "frappe.client.get_value",
                "args": {
                    "doctype": "Employee",
                    "filters": { "user_id": frappe.session.user },
                    'fieldname': [
                        'name',
                        'employee_number',
                        'employee_name' ,
                        'user_id' ,
                        'department' ,
                        'company' ,
                        'reports_to'
                    ]
                },
                "callback": function(response) {
                    var empl = response.message;

                    if (empl) {
                        //frappe.msgprint("Employee: " + empl.name);
                        frm.set_value("draft_employee", empl.employee_number);
                        frm.set_value("draft_user", empl.user_id);
                        frm.set_value("user_name", empl.employee_name);
                        frm.set_value("draft_dept", empl.department);
                        frm.set_value("company", empl.company);
                        frm.set_value("draft_date", frappe.datetime.nowdate());

                        var child1 = cur_frm.add_child("approval_line");
                        //frappe.model.set_value(child.doctype, child.name, "employee", "70087")
                        child1.employee = empl.employee_number;
                        child1.emp_name = empl.employee_name;
                        //child1.approve_date = frappe.datetime.nowdate();
                        if (empl.reports_to ){
                            var child2 = cur_frm.add_child("approval_line");
                            //frappe.model.set_value(child.doctype, child.name, "employee", "70087")
                            child2.employee=empl.reports_to;
                        }
                        cur_frm.refresh_fields("approval_line");


                        //frappe.msgprint("Employee: " + empl.department);
                    } else {
                        frappe.msgprint("Employee not found");
                    }
                }
            });

		}
        if(frm.doc.workflow_state == "Approved" ||frm.doc.workflow_state == "Confirmed"  ){
            frm.toggle_enable("title", false);
            frm.toggle_enable("contents", false);
            frm.toggle_enable("approval_line", false);
            frm.toggle_enable("approval_type", false);
            frm.toggle_enable("share_grade", false);
            frm.toggle_enable("archive", false);
            frm.toggle_enable("draft_date", false);
        }

		//frm.toggle_enable("field_name", false);
		//cur_frm.toggle_display("field_name", false);

		

	},
	before_workflow_action: function(frm) {
	    var check_app = 0;
        if(frm.doc.workflow_state == "Approved" ||frm.doc.workflow_state == "Confirmed"  ){
            for(var i=0;i<eval(frm.doc.approval_line).length ;i++){
                if(frm.doc.approval_line[i].user_id == frappe.session.user && frm.doc.approval_line[i].approved == 1 && i > 0){
                    frappe.throw("Already Approved.");
                    frappe.validated = false;
                }else if(frm.doc.approval_line[i].user_id == frappe.session.user && frm.doc.approval_line[i].approved == 1 && i == 0 && frm.doc.approval_line[i+1].approved == 1){
                    frappe.throw("Can not Return.");
                    frappe.validated = false;
                }else if(frm.doc.approval_line[i].user_id == frappe.session.user && frm.doc.approval_line[i].approved == 0 && i > 0 && frm.doc.approval_line[i-1].approved == 0){
                    frappe.throw("Can not Approve.");
                    frappe.validated = false;

                }else if(frm.doc.approval_line[i].user_id != frappe.session.user){
                    check_app = check_app+1;
                }
            }
            //console.log(check_app);
            if (eval(frm.doc.approval_line).length == check_app){
                frappe.throw("Can not Approve. Check approval line");
                frappe.validated = false;
            }
        }

	},
	after_workflow_action: function(frm) {
	    if(frm.doc.workflow_state == "Approved" ||frm.doc.workflow_state == "Confirmed"  ){
            frm.toggle_enable("title", false);
            frm.toggle_enable("contents", false);
            frm.toggle_enable("approval_line", false);
            frm.toggle_enable("approval_type", false);
            frm.toggle_enable("share_grade", false);
            frm.toggle_enable("archive", false);
            frm.toggle_enable("draft_date", false);

        }else if(frm.doc.workflow_state == "Draft"){
            frm.toggle_enable("title", true);
            frm.toggle_enable("contents", true);
            frm.toggle_enable("approval_line", true);
            frm.toggle_enable("approval_type", true);
            frm.toggle_enable("share_grade", true);
            frm.toggle_enable("archive", true);
            frm.toggle_enable("draft_date", true);
        }
        //alert(eval(frm.doc.approval_line).length);
//        for(var i=0;i<eval(frm.doc.approval_line).length ;i++){
//            if(frm.doc.approval_line[i].user_id == frappe.session.user ){
//                //frm.toggle_enable("approval_line", true);
//                if(frm.doc.workflow_state == "Approved" ||frm.doc.workflow_state == "Confirmed"  ){
//                    frm.doc.approval_line[i].approve_date = frappe.datetime.nowdate();
//                    frm.doc.approval_line[i].approved = 1;
//                    frm.dirty();
//                    frm.save();
//                }else{
//                    frm.doc.approval_line[i].approve_date = "";
//                    frm.doc.approval_line[i].approved = 0;
//                    frm.dirty();
//                    frm.save();
//                }
//                //frm.toggle_enable("approval_line", false);
//            }
//            cur_frm.refresh_field("approval_line");
//        }

//        if(frm.doc.workflow_state == "Approved" ||frm.doc.workflow_state == "Confirmed"  ){

//	        cur_frm.assign_to.add();
//	        let docs = [{"description":"test1","doctype":"ToDo"}];
//            const funcs = docs.map((doc) => {
//              frappe.call({
//                method: "frappe.client.insert",
//                args: {
//                  doc: doc // doc object
//                },
//                callback: function(r) {
//                  //callback script
//                }
//              });
//            });
//
//            Promise.all(funcs).then(()=> {
//              console.log("Done");
//            });

//	    }

        //cur_frm.assign_to.remove(cur_frm.doc.owner);

        //cur_frm.assign_to.dialog.primary_action();
        //cur_frm.assign_to.dialog.set_values({field:"value"});
        //cur_frm.assign_to.dialog.hide();
                //cur_frm.assign_to.dialog.set_values({v:frm.doc.approval_line[i].user_id });
                //cur_frm.assign_to.dialog.set_values({description:frm.doc.title });
                //cur_frm.assign_to.add_assignment();
	},



    before_save: function(frm) {
		// preserve temporary names on production plan item to re-link sub-assembly items
		frm.doc.approval_count = eval(frm.doc.approval_line).length;
	},
	validate: function(frm, cdt, cdn) {
	    for(var i=0;i<eval(frm.doc.approval_line).length ;i++){
	        //msgprint(frm.doc.approval_line[i].approve_date);
	        //if(frm.doc.approval_line[i].approve_date)
            if(i>0 && !frm.doc.approval_line[i-1].approve_date && frm.doc.approval_line[i].user_id == frappe.session.user ){
                if(frm.doc.workflow_state == "Approved" ||frm.doc.workflow_state == "Confirmed"  ){
                    //msgprint("Can not Approve.");
                    //validated = false;
                    //throw "Not allowed";
                }
                //frm.toggle_enable("approval_line", false);
            }
            if(!frm.doc.approval_line[eval(frm.doc.approval_line).length-1].approve_date){
                //msgprint("Can not Approve.");
                //validated = false;
                //throw "Not allowed";
            }
        }

	     //cur_frm.assign_to.add();
         //cur_frm.assign_to.dialog.hide();
         //cur_frm.assign_to.dialog.set_values({assign_to: frm.doc.current_technician.user_id,description:frm.doc.subject});
         //cur_frm.assign_to.add_assignment();


	}


});


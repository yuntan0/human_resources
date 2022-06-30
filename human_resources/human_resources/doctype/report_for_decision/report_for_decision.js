// Copyright (c) 2022, John Park and contributors
// For license information, please see license.txt

frappe.ui.form.on('Report For Decision', {
	refresh: function(frm) {

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
                        'company'
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



                        //frappe.msgprint("Employee: " + empl.department);
                    } else {
                        frappe.msgprint("Employee not found");
                    }
                }
            });
		}

		

	}
});


# Copyright (c) 2022, John Park and contributors
# For license information, please see license.txt

import frappe
from frappe import utils
from frappe.model.document import Document

class ReportForDecision(Document):
    def on_update(self):                 # if state is changed before submit
        print(self.workflow_state)
        if self.workflow_state == 'Confirmed':
            print("##################################################################")
            print(len(self.get("approval_line")))
            for approval in self.approval_line:
                if approval.user_id == frappe.session.user and approval.approved == 0:
                    approval.approved = 1
                    approval.approve_date = frappe.utils.nowdate()
                    if approval.approve_type == 'Approve':
                        approval.approve_status = 'Approved'
                    elif approval.approve_type == 'Agree':
                        approval.approve_status = 'Agreed'
                    elif approval.approve_type == 'Confirm':
                        approval.approve_status = 'Confirmed'

                    approval.save()
                    print("################################ Updated ##################################")
                elif approval.user_id == frappe.session.user and approval.approved == 1:
                    frappe.msgprint(
                        msg='Already Approved',
                        title='Error' ,
                        raise_exception=Error
                    )
                elif approval.user_id != self.draft_user and approval.approved == 0:
                    if not frappe.db.exists('ToDo',{'reference_type':'Report For Decision', 'reference_name':self.name , 'owner': approval.user_id }):
                        todo = frappe.new_doc('ToDo')
                        todo.owner = approval.user_id
                        todo.reference_type = 'Report For Decision'
                        todo.reference_name = self.name
                        todo.assigned_by = self.draft_user
                        todo.description = 'Assignment for Report For Decision '+self.name
                        todo.status = 'Open'
                        todo.priority = 'Medium'
                        todo.role = 'Employee'
                        todo.insert()
                        print(approval.user_id)
                        print("############################## Assigned ####################################")

        elif self.workflow_state == 'Rejected':
            print("################################ Rejected ##################################")
            frappe.db.set_value('RFD Approval Line', approval.name, 'approved', 1)
            frappe.db.set_value('RFD Approval Line', approval.name, 'approve_date', frappe.utils.nowdate())
            frappe.db.set_value('RFD Approval Line', approval.name, 'approve_status', 'Rejected')
            self.reload()
        elif self.workflow_state == 'Approved':
            for approval in self.approval_line:
                if len(self.get("approval_line")) == approval.idx and approval.user_id == frappe.session.user:
                    print("############################### Final approve ###################################")
                    frappe.db.set_value('RFD Approval Line', approval.name, 'approved', 1 )
                    frappe.db.set_value('RFD Approval Line', approval.name, 'approve_date', frappe.utils.nowdate() )
                    frappe.db.set_value('RFD Approval Line', approval.name, 'approve_status', 'Approved')
                    self.reload()

        elif self.workflow_state == 'Draft':
            print("############################# Return #####################################")
            for approval in self.approval_line:
                print(approval.user_id)
                if approval.user_id == frappe.session.user and approval.approved == 1:
                    approval.approved = 0
                    approval.approve_date = ''
                    approval.approve_status = ''
                    self.save();
                    # delete_todo(self.name)
                    for t in frappe.get_all('ToDo', ['name'], {'reference_type': 'Report For Decision', 'reference_name': self.name}):
                        frappe.delete_doc('ToDo', t.name)

            # if int(frappe.db.get_value('Approval Line', {'parent':self.name , 'user_id': frappe.session.user } , 'idx')) > 0:
            #     print("##################################################################")
            #
            #     approval_line = frappe.get_doc('Approval Line', {'parent': self.name, 'user_id': frappe.session.user})
            #     if approval_line.approved == 0 :
            #         approval_line.approved = 1
            #         approval_line.approve_date = frappe.utils.nowdate()
    def on_update_after_submit(self):    # if state is changed after submit
        print(self.workflow_state)
        # if self.workflow_state == 'Return':
        #     print("##################################################################")
        #     for approval in self.approval_line:
        #         print(approval.user_id)
        #         if approval.user_id == frappe.session.user and approval.approved == 1:
        #             approval.approved = 0
        #             approval.approve_date = ''
        #             self.save();

    # def validate(self):
    #     frappe.msgprint(frappe._("validate!"))




    # def assign_task_to_users(self, task, users):
    # 	for user in users:
    # 		args = {
    # 			'assign_to' :	user,
    # 			'doctype'		:	task.doctype,
    # 			'
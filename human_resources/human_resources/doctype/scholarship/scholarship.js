// Copyright (c) 2022, John Park and contributors
// For license information, please see license.txt

// return placeholder text if link_field value is falsy
//let text_to_show = value => {
//	return value ? value : '-';
//};
//
//// this function will be called from the Form's onload/onrefresh
//// to fetch the value from the DB and render the Link field title initially
//let init_field_title = (frm, link_field_name) => {
//	if (!frm.fields_dict[link_field_name].value)
//		return;
//	frappe.db.get_doc(
//		frm.fields_dict[link_field_name].df.options,
//		frm.fields_dict[link_field_name].value
//	).then(result => {
//		render_field_title(frm, link_field_name, text_to_show(result.title));
//	});
//};
//
//// the render function itself, just to be DRY
//let render_field_title = (frm, title, text) => {
//	let field = frm.fields_dict[title];
//	field.label_span.innerHTML = '${__(field._label)}&nbsp-&nbsp<b>${text}</b>';
//};

frappe.ui.form.on('Scholarship', {
	// refresh: function(frm) {

	// }
//	refresh: frm => {
//		init_field_title(frm, 'code');
//	},
//
//	// update the link field title on the selection change
//	link_package: frm => {
//		let field = 'code';
//		frappe.db.get_doc(frm.fields_dict[field].df.options, frm.fields_dict[field].value).then(result => {
//			render_field_title(frm, field, text_to_show(result.title));   // my Link fields have a display field named 'title'
//		});
//	},
});

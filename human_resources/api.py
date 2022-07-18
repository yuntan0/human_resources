from __future__ import unicode_literals
import frappe
import cx_Oracle
import json
import sqlalchemy as sqla
import pandas as pd
import gc
import os ,sys
from bs4 import BeautifulSoup
import locale
################################## TEST Command #########################################
# bench execute human_resources.api.select_sql --kwargs "{'statement':'select_hra101'}"
#########################################################################################

@frappe.whitelist()
def select_sql(**kwargs):
    statement = kwargs.get('statement')
    conditions =  kwargs.get('conditions')
    username = ""
    password = ""
    hostname = ""
    port = ""
    servicename = ""
    sql_file = os.path.join(os.getcwd(), 'develop_sql.xml')
    with open(sql_file) as sql_f:
        sql_file = sql_f.read()
        sql_soup = BeautifulSoup(sql_file, "xml")
        sql_statement = sql_soup.find(id=statement)
        sql = sql_statement.text.strip()
        if conditions is not None:
            sql = sql + " " + str(conditions)
        print(sql)
    database_file = os.path.join(os.getcwd(), 'develop_database.json')
    with open(database_file) as f:
        database = json.load(f)
        username = database["user"]
        password = database["password"]
        hostname = database["hostname"]
        port = database["port"]
        servicename = database["servicename"]
    print("----------FNSINC DB Connetion----------")
    result = execute_select(sql ,username, password, hostname ,port , servicename)
    print(result)
    # oracle = Oracle.connect('username', 'password', 'hostname' , 'port', 'servicename')
    #
    # try:
    #     # No commit as you don-t need to commit DDL.
    #     oracle.execute('ddl_statements')
    #     #result = oracle.execute_select('"SELECT 0 FROM DUAL"')
    #
    # # Ensure that we always disconnect from the database to avoid
    # # ORA-00018: Maximum number of sessions exceeded.
    # finally:
    #     oracle.disconnect()


@frappe.whitelist()
def test_sql(**kwargs):
    print("----------FNSINC DB Connetion----------")

def execute_select(sql ,username, password, hostname ,port , servicename):
    """
    Execute whatever SQL statements are passed to the method;
    commit if specified. Do not specify fetchall() in here as
    the SQL statement may not be a select.
    bindvars is a dictionary of variables you pass to execute.
    """


    result = ""
    json_data = []

    try:
        db = cx_Oracle.connect(username, password, hostname + ':' + port + '/' + servicename)
        cursor = db.cursor()
        cursor.execute(sql)

        rv = cursor.fetchall()
        row_headers = [x[0] for x in cursor.description]
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers,result)))
        cursor.close()
        db.close()
        # db = cx_Oracle.connect(username, password, hostname + ':' + port + '/' + servicename)
        # cursor = db.cursor()
        # cursor.execute(sql)
        # rows = cursor.fetchall()
        # rowarray_list = []
        # for row in rows:
        #     t = (row[0], row[1], row[2], row[3], row[4], row[5], row[6])
        #     rowarray_list.append(t)
        #
        # result = json.dumps(rowarray_list)
        #
        # #result = [dict((cursor.description[i][0], value) \ for i, value in enumerate(row)) for row in cursor.fetchall()]
        # cursor.close()
        # db.close()


    except cx_Oracle.DatabaseError as e:
            # Log error as appropriate
        raise
    return json_data

class Oracle(object):
    def connect(self, username, password, hostname, port, servicename):
        # Connect to the database.
        try:
            self.db = cx_Oracle.connect(username, password , hostname + ':' + port + '/' + servicename)
        except cx_Oracle.DatabaseError as e:
            # Log error as appropriate
            raise

        # If the database connection succeeded create the cursor
        # we-re going to use.
        self.cursor = self.db.cursor()

    def disconnect(self):
        """
        Disconnect from the database. If this fails, for instance
        if the connection instance doesn't exist, ignore the exception.
        """
        try:
            self.cursor.close()
            self.db.close()
        except cx_Oracle.DatabaseError:
            pass
        
    def execute(self, sql, bindvars=None, commit=False):
        """
        Execute whatever SQL statements are passed to the method;
        commit if specified. Do not specify fetchall() in here as
        the SQL statement may not be a select.
        bindvars is a dictionary of variables you pass to execute.
        """

        try:
            self.cursor.execute(sql, bindvars)

        except cx_Oracle.DatabaseError as e:
            # Log error as appropriate
            raise

        # Only commit if it-s necessary.
        if commit:
            self.db.commit()
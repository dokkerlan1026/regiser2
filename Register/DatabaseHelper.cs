using System;
using System.IO;
using Microsoft.Data.Sqlite;

namespace Register
{
    public static class DatabaseHelper
    {
        private const string DbName = "clinic.db";
        public static string ConnectionString => $"Data Source={DbName}";

        public static void InitializeDatabase()
        {
            bool isNew = !File.Exists(DbName);

            using (var connection = new SqliteConnection(ConnectionString))
            {
                connection.Open();

                // 建立科別表
                var createDepartments = @"
                    CREATE TABLE IF NOT EXISTS Departments (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        Name TEXT NOT NULL
                    );";

                // 建立時段表
                var createTimeSlots = @"
                    CREATE TABLE IF NOT EXISTS TimeSlots (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        Name TEXT NOT NULL
                    );";

                // 建立醫生表
                var createDoctors = @"
                    CREATE TABLE IF NOT EXISTS Doctors (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        Name TEXT NOT NULL,
                        DepartmentId INTEGER,
                        FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
                    );";

                // 建立醫生排班表
                var createDoctorSchedules = @"
                    CREATE TABLE IF NOT EXISTS DoctorSchedules (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        DoctorId INTEGER,
                        TimeSlotId INTEGER,
                        FOREIGN KEY (DoctorId) REFERENCES Doctors(Id),
                        FOREIGN KEY (TimeSlotId) REFERENCES TimeSlots(Id)
                    );";

                // 建立病患表
                var createPatients = @"
                    CREATE TABLE IF NOT EXISTS Patients (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        MedicalRecordNo TEXT UNIQUE,
                        NationalId TEXT UNIQUE,
                        Name TEXT NOT NULL,
                        Gender TEXT,
                        BirthDate TEXT,
                        Phone TEXT,
                        Address TEXT
                    );";

                // 建立掛號表
                var createRegistrations = @"
                    CREATE TABLE IF NOT EXISTS Registrations (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        PatientId INTEGER,
                        DoctorId INTEGER,
                        TimeSlotId INTEGER,
                        RegDate TEXT,
                        RegNumber INTEGER,
                        IsFirstTime BOOLEAN,
                        FOREIGN KEY (PatientId) REFERENCES Patients(Id),
                        FOREIGN KEY (DoctorId) REFERENCES Doctors(Id),
                        FOREIGN KEY (TimeSlotId) REFERENCES TimeSlots(Id)
                    );";

                ExecuteQuery(connection, createDepartments);
                ExecuteQuery(connection, createTimeSlots);
                ExecuteQuery(connection, createDoctors);
                ExecuteQuery(connection, createDoctorSchedules);
                ExecuteQuery(connection, createPatients);
                ExecuteQuery(connection, createRegistrations);

                if (isNew)
                {
                    SeedData(connection);
                }
            }
        }

        private static void ExecuteQuery(SqliteConnection connection, string query)
        {
            using (var command = connection.CreateCommand())
            {
                command.CommandText = query;
                command.ExecuteNonQuery();
            }
        }

        private static void SeedData(SqliteConnection connection)
        {
            // 預設科別
            var insertDepts = "INSERT INTO Departments (Name) VALUES ('內科'), ('外科'), ('皮膚科'), ('眼科'), ('牙科'), ('小兒科'), ('婦產科');";
            ExecuteQuery(connection, insertDepts);

            // 預設時段
            var insertTimes = "INSERT INTO TimeSlots (Name) VALUES ('上午 (09:00-12:00)'), ('下午 (14:00-17:00)'), ('晚上 (18:30-21:30)');";
            ExecuteQuery(connection, insertTimes);

            // 預設醫師與排班 (每個科別分配2名醫師)
            var insertDocs = @"
                INSERT INTO Doctors (Name, DepartmentId) VALUES 
                ('趙一 (內科)', 1), ('錢二 (內科)', 1),
                ('孫三 (外科)', 2), ('李四 (外科)', 2),
                ('周五 (皮膚科)', 3), ('吳六 (皮膚科)', 3),
                ('鄭七 (眼科)', 4), ('王八 (眼科)', 4),
                ('馮九 (牙科)', 5), ('陳十 (牙科)', 5),
                ('黃十一 (小兒科)', 6), ('張十二 (小兒科)', 6),
                ('林十三 (婦產科)', 7), ('劉十四 (婦產科)', 7);
            ";
            ExecuteQuery(connection, insertDocs);

            // 每位醫師都預設所有時段
            var insertSchedules = @"
                INSERT INTO DoctorSchedules (DoctorId, TimeSlotId)
                SELECT d.Id, t.Id FROM Doctors d CROSS JOIN TimeSlots t;
            ";
            ExecuteQuery(connection, insertSchedules);
        }
    }
}

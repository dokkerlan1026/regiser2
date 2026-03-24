namespace Register
{
	public class ComboItem
	{
		public int Id { get; set; }
		public string Name { get; set; } = string.Empty;
		public override string ToString() => Name;
	}

	public partial class Reg : Form
	{
		public Reg()
		{
			InitializeComponent();
			LoadInitialData();
		}

		private void LoadInitialData()
		{
			departmentComboBox.Items.Clear();
			timeSlotComboBox.Items.Clear();
			
			using (var conn = new Microsoft.Data.Sqlite.SqliteConnection(DatabaseHelper.ConnectionString))
			{
				conn.Open();
				using (var cmd = conn.CreateCommand())
				{
					cmd.CommandText = "SELECT Id, Name FROM Departments";
					using (var reader = cmd.ExecuteReader())
					{
						while (reader.Read())
						{
							departmentComboBox.Items.Add(new ComboItem { Id = reader.GetInt32(0), Name = reader.GetString(1) });
						}
					}
				}
				using (var cmd = conn.CreateCommand())
				{
					cmd.CommandText = "SELECT Id, Name FROM TimeSlots";
					using (var reader = cmd.ExecuteReader())
					{
						while (reader.Read())
						{
							timeSlotComboBox.Items.Add(new ComboItem { Id = reader.GetInt32(0), Name = reader.GetString(1) });
						}
					}
				}
			}

			departmentComboBox.DisplayMember = "Name";
			departmentComboBox.ValueMember = "Id";
			timeSlotComboBox.DisplayMember = "Name";
			timeSlotComboBox.ValueMember = "Id";
			doctorComboBox.DisplayMember = "Name";
			doctorComboBox.ValueMember = "Id";

			genderComboBox.SelectedIndex = 0;
			cityComboBox.SelectedIndex = 2;
			
			departmentComboBox.SelectedIndexChanged += DepartmentOrTimeSlot_Changed;
			timeSlotComboBox.SelectedIndexChanged += DepartmentOrTimeSlot_Changed;
		}

		private void DepartmentOrTimeSlot_Changed(object sender, EventArgs e)
		{
			doctorComboBox.Items.Clear();
			if (departmentComboBox.SelectedItem == null || timeSlotComboBox.SelectedItem == null)
				return;
				
			var dept = (ComboItem)departmentComboBox.SelectedItem;
			var time = (ComboItem)timeSlotComboBox.SelectedItem;

			using (var conn = new Microsoft.Data.Sqlite.SqliteConnection(DatabaseHelper.ConnectionString))
			{
				conn.Open();
				using (var cmd = conn.CreateCommand())
				{
					cmd.CommandText = @"
						SELECT d.Id, d.Name 
						FROM Doctors d
						JOIN DoctorSchedules ds ON d.Id = ds.DoctorId
						WHERE d.DepartmentId = $deptId AND ds.TimeSlotId = $timeId";
					cmd.Parameters.AddWithValue("$deptId", dept.Id);
					cmd.Parameters.AddWithValue("$timeId", time.Id);

					using (var reader = cmd.ExecuteReader())
					{
						while (reader.Read())
						{
							doctorComboBox.Items.Add(new ComboItem { Id = reader.GetInt32(0), Name = reader.GetString(1) });
						}
					}
				}
			}
		}

		private void IdNumberTextBox_TextChanged(object sender, EventArgs e)
		{
		}

		private void BirthdayTextBox_TextChanged(object sender, EventArgs e)
		{
			string input = birthdayTextBox.Text.Replace("_", "").Replace(" ", "").Trim();
			if (input.Length == 7) // 民國年 YYYMMDD
			{
				try
				{
					string yearStr = input.Substring(0, 3);
					if (int.TryParse(yearStr, out int rocYear))
					{
						int solarYear = rocYear + 1911;
						int currentYear = DateTime.Now.Year;
						int age = currentYear - solarYear;
						if (age >= 0 && age < 150)
						{
							ageTextBox.Text = age.ToString();
						}
					}
				}
				catch { }
			}
		}

		private void PhoneTextBox_TextChanged(object sender, EventArgs e)
		{
		}

		private void ConfirmButton_Click(object sender, EventArgs e)
		{
			MessageBox.Show($"{nameTextBox.Text} 同學，掛號成功！", "系統訊息", MessageBoxButtons.OK, MessageBoxIcon.Information);
		}

		private void ClearButton_Click(object sender, EventArgs e)
		{
			idNumberTextBox.Clear();
			nationalIdTextBox.Clear();
			nameTextBox.Clear();
			birthdayTextBox.Clear();
			ageTextBox.Clear();
			phoneTextBox.Clear();
			addressTextBox.Clear();
			regDateTextBox.Clear();
			regNumberTextBox.Clear();
			
			genderComboBox.SelectedIndex = 0;
			cityComboBox.SelectedIndex = 0;
			districtComboBox.SelectedIndex = -1;
			departmentComboBox.SelectedIndex = -1;
			timeSlotComboBox.SelectedIndex = -1;
			doctorComboBox.SelectedIndex = -1;
			
			idNumberTextBox.Focus();
		}

		private void ExitButton_Click(object sender, EventArgs e)
		{
			Application.Exit();
		}

		private void PrintButton_Click(object sender, EventArgs e)
		{
			MessageBox.Show("正在列印掛號單...", "列印中", MessageBoxButtons.OK, MessageBoxIcon.Information);
		}

		private void BtnSchedule_Click(object sender, EventArgs e)
		{
			new DoctorScheduleForm().ShowDialog();
		}

		private void BtnPatients_Click(object sender, EventArgs e)
		{
			new PatientManagementForm().ShowDialog();
		}

		private void BtnDept_Click(object sender, EventArgs e)
		{
			new DepartmentManagementForm().ShowDialog();
		}

		private void BtnReport_Click(object sender, EventArgs e)
		{
			new ReportForm().ShowDialog();
		}
	}
}
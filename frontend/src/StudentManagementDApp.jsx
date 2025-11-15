import React, { useState } from 'react';
import { Users, BookOpen, Award, Plus, Search, GraduationCap, TrendingUp } from 'lucide-react';

const StudentManagementDApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [students, setStudents] = useState([
    { id: 'SV001', name: 'Nguyễn Văn A', email: 'vana@university.edu', major: 'Computer Science', year: 2024, gpa: 3.75, credits: 45, active: true },
    { id: 'SV002', name: 'Trần Thị B', email: 'thib@university.edu', major: 'Business Admin', year: 2023, gpa: 3.52, credits: 78, active: true },
    { id: 'SV003', name: 'Lê Văn C', email: 'vanc@university.edu', major: 'Engineering', year: 2024, gpa: 3.88, credits: 32, active: true },
  ]);
  
  const [grades, setGrades] = useState([
    { studentId: 'SV001', courseCode: 'CS101', courseName: 'Introduction to Programming', credits: 3, grade: 8.5, semester: 'Fall 2024' },
    { studentId: 'SV001', courseCode: 'MATH201', courseName: 'Calculus II', credits: 4, grade: 7.8, semester: 'Fall 2024' },
  ]);

  const [certificates, setCertificates] = useState([
    { studentId: 'SV001', name: 'Best Student Award', issuedBy: 'Computer Science Department', date: '2024-05-15' },
  ]);

  const [newStudent, setNewStudent] = useState({
    id: '', name: '', email: '', major: '', year: 2024
  });

  const [newGrade, setNewGrade] = useState({
    studentId: '', courseCode: '', courseName: '', credits: 3, grade: 0, semester: ''
  });

  const [newCertificate, setNewCertificate] = useState({
    studentId: '', name: '', issuedBy: '', date: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const connectWallet = async () => {
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    setWalletAddress(mockAddress);
    setIsConnected(true);
    alert('Wallet connected successfully!');
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  const handleCreateStudent = () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!newStudent.id || !newStudent.name || !newStudent.email || !newStudent.major) {
      alert('Please fill all fields!');
      return;
    }
    
    const student = { ...newStudent, gpa: 0, credits: 0, active: true };
    setStudents([...students, student]);
    setNewStudent({ id: '', name: '', email: '', major: '', year: 2024 });
    alert('Student created successfully! (Transaction submitted to Sui)');
  };

  const handleAddGrade = () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!newGrade.studentId || !newGrade.courseCode || !newGrade.courseName) {
      alert('Please fill all fields!');
      return;
    }
    
    setGrades([...grades, newGrade]);
    setNewGrade({ studentId: '', courseCode: '', courseName: '', credits: 3, grade: 0, semester: '' });
    alert('Grade added successfully! (Transaction submitted to Sui)');
  };

  const handleIssueCertificate = () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!newCertificate.studentId || !newCertificate.name || !newCertificate.issuedBy) {
      alert('Please fill all fields!');
      return;
    }
    
    setCertificates([...certificates, newCertificate]);
    setNewCertificate({ studentId: '', name: '', issuedBy: '', date: '' });
    alert('Certificate issued successfully! (Transaction submitted to Sui)');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Students</p>
              <p className="text-3xl font-bold mt-2">{students.length}</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Grades</p>
              <p className="text-3xl font-bold mt-2">{grades.length}</p>
            </div>
            <BookOpen className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Certificates</p>
              <p className="text-3xl font-bold mt-2">{certificates.length}</p>
            </div>
            <Award className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Recent Students
        </h3>
        <div className="space-y-3">
          {students.slice(0, 5).map(student => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.id} - {student.major}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">GPA: {student.gpa.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{student.credits} credits</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const StudentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Create New Student</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Student ID (e.g., SV004)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newStudent.id}
            onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
          />
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newStudent.name}
            onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newStudent.email}
            onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
          />
          <input
            type="text"
            placeholder="Major"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newStudent.major}
            onChange={(e) => setNewStudent({...newStudent, major: e.target.value})}
          />
          <input
            type="number"
            placeholder="Enrollment Year"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newStudent.year}
            onChange={(e) => setNewStudent({...newStudent, year: parseInt(e.target.value)})}
          />
          <button
            onClick={handleCreateStudent}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student ID</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Major</th>
                <th className="text-left py-3 px-4">GPA</th>
                <th className="text-left py-3 px-4">Credits</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{student.id}</td>
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                  <td className="py-3 px-4">{student.major}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600">{student.gpa.toFixed(2)}</td>
                  <td className="py-3 px-4">{student.credits}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${student.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {student.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const GradesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Grade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newGrade.studentId}
            onChange={(e) => setNewGrade({...newGrade, studentId: e.target.value})}
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Course Code (e.g., CS101)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newGrade.courseCode}
            onChange={(e) => setNewGrade({...newGrade, courseCode: e.target.value})}
          />
          <input
            type="text"
            placeholder="Course Name"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newGrade.courseName}
            onChange={(e) => setNewGrade({...newGrade, courseName: e.target.value})}
          />
          <input
            type="number"
            placeholder="Credits"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newGrade.credits}
            onChange={(e) => setNewGrade({...newGrade, credits: parseInt(e.target.value)})}
          />
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="Grade (0-10)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newGrade.grade}
            onChange={(e) => setNewGrade({...newGrade, grade: parseFloat(e.target.value)})}
          />
          <input
            type="text"
            placeholder="Semester (e.g., Fall 2024)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newGrade.semester}
            onChange={(e) => setNewGrade({...newGrade, semester: e.target.value})}
          />
          <button
            onClick={handleAddGrade}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 md:col-span-2"
          >
            <Plus className="w-4 h-4" />
            Add Grade
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">All Grades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student ID</th>
                <th className="text-left py-3 px-4">Course Code</th>
                <th className="text-left py-3 px-4">Course Name</th>
                <th className="text-left py-3 px-4">Credits</th>
                <th className="text-left py-3 px-4">Grade</th>
                <th className="text-left py-3 px-4">Semester</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{grade.studentId}</td>
                  <td className="py-3 px-4">{grade.courseCode}</td>
                  <td className="py-3 px-4">{grade.courseName}</td>
                  <td className="py-3 px-4">{grade.credits}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${grade.grade >= 8 ? 'text-green-600' : grade.grade >= 6.5 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {grade.grade.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{grade.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const CertificatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Issue New Certificate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newCertificate.studentId}
            onChange={(e) => setNewCertificate({...newCertificate, studentId: e.target.value})}
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Certificate Name"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newCertificate.name}
            onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Issued By"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newCertificate.issuedBy}
            onChange={(e) => setNewCertificate({...newCertificate, issuedBy: e.target.value})}
          />
          <input
            type="date"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newCertificate.date}
            onChange={(e) => setNewCertificate({...newCertificate, date: e.target.value})}
          />
          <button
            onClick={handleIssueCertificate}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 md:col-span-2"
          >
            <Award className="w-4 h-4" />
            Issue Certificate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">All Certificates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert, idx) => (
            <div key={idx} className="border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-white">
              <Award className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="font-bold text-lg mb-2">{cert.name}</h4>
              <p className="text-sm text-gray-600 mb-1">Student: {cert.studentId}</p>
              <p className="text-sm text-gray-600 mb-1">Issued by: {cert.issuedBy}</p>
              <p className="text-sm text-gray-500">Date: {cert.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Student Management</h1>
                <p className="text-xs text-gray-500">Powered by Sui Blockchain</p>
              </div>
            </div>
            
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Connected</p>
                  <p className="text-xs text-gray-500">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'grades', label: 'Grades', icon: BookOpen },
              { id: 'certificates', label: 'Certificates', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'grades' && <GradesTab />}
        {activeTab === 'certificates' && <CertificatesTab />}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2024 Student Management DApp - Built on Sui Blockchain</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentManagementDApp;
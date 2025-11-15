import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, Plus, Search, GraduationCap, TrendingUp } from 'lucide-react';
import { useSuiWallet } from '../hooks/useSuiWallet';
import { createStudent, addGrade, issueCertificate, fetchStudentsFromBlockchain, fetchCertificatesFromBlockchain } from '../utils/suiClient';
import { ConnectButton } from '@mysten/dapp-kit';

const StudentManagement = () => {
  const { isConnected, address, signAndExecuteTransactionBlock } = useSuiWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showAddCertificateForm, setShowAddCertificateForm] = useState(false);
  
  // Load dữ liệu từ localStorage khi component mount
  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  };
  
  const [students, setStudents] = useState(() => 
    loadFromLocalStorage('students', [
      { id: 'SV001', name: 'Nguyễn Văn A', email: 'vana@university.edu', major: 'Computer Science', year: 2024, gpa: 3.75, credits: 45, active: true },
      { id: 'SV002', name: 'Trần Thị B', email: 'thib@university.edu', major: 'Business Admin', year: 2023, gpa: 3.52, credits: 78, active: true },
      { id: 'SV003', name: 'Lê Văn C', email: 'vanc@university.edu', major: 'Engineering', year: 2024, gpa: 3.88, credits: 32, active: true },
    ])
  );
  
  const [grades, setGrades] = useState(() =>
    loadFromLocalStorage('grades', [
      { studentId: 'SV001', courseCode: 'CS101', courseName: 'Introduction to Programming', credits: 3, grade: 8.5, semester: 'Fall 2024' },
      { studentId: 'SV001', courseCode: 'MATH201', courseName: 'Calculus II', credits: 4, grade: 7.8, semester: 'Fall 2024' },
    ])
  );

  const [certificates, setCertificates] = useState(() =>
    loadFromLocalStorage('certificates', [
      { studentId: 'SV001', name: 'Best Student Award', issuedBy: 'Computer Science Department', date: '2024-05-15' },
    ])
  );
  
  // Lưu vào localStorage mỗi khi dữ liệu thay đổi
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);
  
  useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
  }, [grades]);
  
  useEffect(() => {
    localStorage.setItem('certificates', JSON.stringify(certificates));
  }, [certificates]);
  
  // Load dữ liệu từ blockchain khi component mount
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        console.log('Loading data from blockchain...');
        
        // Fetch students từ blockchain events
        const blockchainStudents = await fetchStudentsFromBlockchain();
        if (blockchainStudents.length > 0) {
          // Merge với local data, ưu tiên blockchain data
          const mergedStudents = [...students];
          blockchainStudents.forEach(bcStudent => {
            const existingIndex = mergedStudents.findIndex(s => s.id === bcStudent.id);
            if (existingIndex === -1) {
              // Thêm student mới từ blockchain
              mergedStudents.push({
                id: bcStudent.id,
                name: bcStudent.name,
                email: '-',
                major: '-',
                year: 2024,
                gpa: 0,
                credits: 0,
                active: true,
                profileAddress: bcStudent.profileAddress
              });
            }
          });
          setStudents(mergedStudents);
          console.log('Students loaded from blockchain:', blockchainStudents);
        }
        
        // Fetch certificates từ blockchain events
        const blockchainCerts = await fetchCertificatesFromBlockchain();
        if (blockchainCerts.length > 0) {
          const mergedCerts = [...certificates];
          blockchainCerts.forEach(bcCert => {
            const exists = mergedCerts.some(c => 
              c.studentId === bcCert.studentId && c.name === bcCert.name
            );
            if (!exists) {
              mergedCerts.push({
                studentId: bcCert.studentId,
                name: bcCert.name,
                issuedBy: '-',
                date: '-',
                description: '-'
              });
            }
          });
          setCertificates(mergedCerts);
          console.log('Certificates loaded from blockchain:', blockchainCerts);
        }
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      }
    };
    
    loadBlockchainData();
  }, []); // Chỉ chạy 1 lần khi mount

  const [newStudent, setNewStudent] = useState({
    id: '', name: '', email: '', major: '', enrollment_year: 2024
  });

  const [newGrade, setNewGrade] = useState({
    studentId: '', courseCode: '', courseName: '', credits: 3, grade: 0, semester: ''
  });

  const [newCertificate, setNewCertificate] = useState({
    studentId: '', name: '', issuedBy: '', date: '', description: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  // Hàm refresh dữ liệu từ blockchain
  const refreshFromBlockchain = async () => {
    try {
      setLoading(true);
      console.log('Refreshing data from blockchain...');
      
      const blockchainStudents = await fetchStudentsFromBlockchain();
      const blockchainCerts = await fetchCertificatesFromBlockchain();
      
      if (blockchainStudents.length > 0) {
        const updatedStudents = blockchainStudents.map(bcStudent => ({
          id: bcStudent.id,
          name: bcStudent.name,
          email: '-',
          major: '-',
          year: 2024,
          gpa: 0,
          credits: 0,
          active: true,
          profileAddress: bcStudent.profileAddress
        }));
        setStudents(updatedStudents);
      }
      
      if (blockchainCerts.length > 0) {
        const updatedCerts = blockchainCerts.map(bcCert => ({
          studentId: bcCert.studentId,
          name: bcCert.name,
          issuedBy: '-',
          date: '-',
          description: '-'
        }));
        setCertificates(updatedCerts);
      }
      
      alert('✅ Data refreshed from blockchain!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Failed to refresh data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // TÍCH HỢP SUI - Tạo sinh viên
  const handleCreateStudent = async (e) => {
    e?.preventDefault();
    
    if (!isConnected) {
      alert('⚠️ Please connect your Sui Wallet first!\n\nMake sure to:\n1. Install Sui Wallet extension\n2. Switch to TESTNET network\n3. Click Connect button');
      return;
    }
    
    if (!newStudent.id || !newStudent.name || !newStudent.email || !newStudent.major) {
      alert('Please fill all fields!');
      return;
    }

    // Validate enrollment_year is a number
    const enrollmentYear = parseInt(newStudent.enrollment_year);
    if (isNaN(enrollmentYear) || enrollmentYear < 2000 || enrollmentYear > 2100) {
      alert('Please enter a valid enrollment year (2000-2100)');
      return;
    }

    try {
      setLoading(true);
      
      const studentDataToSubmit = {
        ...newStudent,
        enrollment_year: enrollmentYear
      };
      
      console.log('Submitting student data:', studentDataToSubmit);
      
      const result = await createStudent(
        signAndExecuteTransactionBlock,
        studentDataToSubmit
      );
      
      console.log('Transaction result:', result);
      
      const student = { ...newStudent, gpa: 0, credits: 0, active: true };
      setStudents([...students, student]);
      setNewStudent({ id: '', name: '', email: '', major: '', enrollment_year: 2024 });
      setShowAddStudentForm(false);
      
      alert('✅ Student created successfully on Sui blockchain!');
    } catch (error) {
      console.error('Error:', error);
      
      let errorMessage = 'Failed to create student: ' + error.message;
      
      if (error.message.includes('Package object does not exist')) {
        errorMessage = '❌ Contract not found!\n\n' +
          'This usually means:\n' +
          '1. Your wallet is connected to the WRONG NETWORK\n' +
          '2. Please switch to TESTNET in your Sui Wallet\n' +
          '3. Disconnect and reconnect your wallet\n\n' +
          'Contract is deployed on TESTNET only.';
      } else if (error.message.includes('Object') && error.message.includes('is owned by')) {
        errorMessage = '❌ Permission denied!\n\n' +
          'You do not have admin rights.\n' +
          'Only the contract owner can create students.';
      } else if (error.message.includes('TypeMismatch') || error.message.includes('CommandArgumentError')) {
        errorMessage = '❌ Invalid data format!\n\n' +
          'Please check:\n' +
          '1. All fields are filled correctly\n' +
          '2. Enrollment year is a valid number\n' +
          '3. Try refreshing the page';
      }
      
      alert(errorMessage);
      // Không đóng form khi có lỗi, để user có thể thử lại
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelAddStudent = () => {
    setShowAddStudentForm(false);
    setNewStudent({ id: '', name: '', email: '', major: '', enrollment_year: 2024 });
  };

  // TÍCH HỢP SUI - Thêm điểm
  const handleAddGrade = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!newGrade.studentId || !newGrade.courseCode || !newGrade.courseName) {
      alert('Please fill all fields!');
      return;
    }

    try {
      setLoading(true);
      const result = await addGrade(
        signAndExecuteTransactionBlock,
        newGrade,
        address // recipient address
      );
      
      console.log('Transaction result:', result);
      
      setGrades([...grades, newGrade]);
      setNewGrade({ studentId: '', courseCode: '', courseName: '', credits: 3, grade: 0, semester: '' });
      
      alert('Grade added successfully on Sui blockchain!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add grade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // TÍCH HỢP SUI - Cấp chứng chỉ
  const handleIssueCertificate = async (e) => {
    e?.preventDefault();
    
    if (!isConnected) {
      alert('⚠️ Please connect your Sui Wallet first!');
      return;
    }
    
    if (!newCertificate.studentId || !newCertificate.name || !newCertificate.issuedBy || !newCertificate.date) {
      alert('Please fill all required fields!');
      return;
    }

    try {
      setLoading(true);
      
      const certificateData = {
        studentId: newCertificate.studentId,
        name: newCertificate.name,
        issuedBy: newCertificate.issuedBy,
        date: newCertificate.date,
        description: newCertificate.description || '',
        recipient: address
      };
      
      const result = await issueCertificate(
        signAndExecuteTransactionBlock,
        certificateData
      );
      
      console.log('Transaction result:', result);
      
      setCertificates([...certificates, newCertificate]);
      setNewCertificate({ studentId: '', name: '', issuedBy: '', date: '', description: '' });
      setShowAddCertificateForm(false);
      
      alert('✅ Certificate issued successfully on Sui blockchain!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to issue certificate: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelAddCertificate = () => {
    setShowAddCertificateForm(false);
    setNewCertificate({ studentId: '', name: '', issuedBy: '', date: '', description: '' });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // [GIỮ NGUYÊN CÁC COMPONENT TAB NHƯ CŨ: DashboardTab, StudentsTab, GradesTab, CertificatesTab]
  // Chỉ cần thay đổi buttons để hiển thị loading state

  const StudentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Students List
          </h3>
          <div className="flex gap-2">
            <button
              onClick={refreshFromBlockchain}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh from Blockchain
            </button>
            <button
              onClick={() => setShowAddStudentForm(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </div>

        {/* Form thêm sinh viên */}
        {showAddStudentForm && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Add New Student</h4>
              <button
                onClick={handleCancelAddStudent}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., SV001"
                  value={newStudent.id}
                  onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Nguyễn Văn A"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="e.g., student@university.edu"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={newStudent.major}
                  onChange={(e) => setNewStudent({...newStudent, major: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Year
                </label>
                <input
                  type="number"
                  placeholder="2024"
                  value={newStudent.enrollment_year}
                  onChange={(e) => setNewStudent({...newStudent, enrollment_year: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAddStudent}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStudent}
                disabled={loading || !isConnected}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.major}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.year}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{student.gpa.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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

  const CertificatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Certificates
          </h3>
          <div className="flex gap-2">
            <button
              onClick={refreshFromBlockchain}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh from Blockchain
            </button>
            <button
              onClick={() => setShowAddCertificateForm(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Issue Certificate
            </button>
          </div>
        </div>

        {/* Form cấp chứng chỉ */}
        {showAddCertificateForm && (
          <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Issue New Certificate</h4>
              <button
                onClick={handleCancelAddCertificate}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g., SV001"
                  value={newCertificate.studentId}
                  onChange={(e) => setNewCertificate({...newCertificate, studentId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Best Student Award 2024"
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issued By *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science Department"
                  value={newCertificate.issuedBy}
                  onChange={(e) => setNewCertificate({...newCertificate, issuedBy: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={newCertificate.date}
                  onChange={(e) => setNewCertificate({...newCertificate, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Certificate description or achievements..."
                  value={newCertificate.description}
                  onChange={(e) => setNewCertificate({...newCertificate, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAddCertificate}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueCertificate}
                disabled={loading || !isConnected}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Issuing...' : 'Issue Certificate'}
              </button>
            </div>
          </div>
        )}

        {/* Certificates table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certificates.map((cert, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cert.studentId}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{cert.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{cert.issuedBy}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{cert.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{cert.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // [TƯơng tự cho StudentsTab, GradesTab, CertificatesTab...]
  // Đã có trong file trước, chỉ cần đảm bảo button có disabled={loading}

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
                <p className="text-xs text-gray-500">Powered by Sui Blockchain (Testnet)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!isConnected && (
                <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 font-medium">⚠️ Please connect wallet to Sui Testnet</p>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg">Processing transaction...</p>
          </div>
        </div>
      )}

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
        {activeTab === 'certificates' && <CertificatesTab />}
        {/* Thêm các tab khác tương tự */}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2024 Student Management DApp - Built on Sui Blockchain</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentManagement;
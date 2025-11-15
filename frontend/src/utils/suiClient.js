import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACTS, NETWORK } from '../constants/contracts';

// Khởi tạo Sui Client
export const suiClient = new SuiClient({ 
  url: getFullnodeUrl(NETWORK) 
});

// Tạo sinh viên mới
export async function createStudent(
  signAndExecuteTransactionBlock,
  studentData
) {
  console.log('Creating student with data:', studentData);
  console.log('Using contracts:', CONTRACTS);
  
  const tx = new Transaction();
  
  // Ensure enrollment_year is a number
  const enrollmentYear = Number(studentData.enrollment_year);
  
  console.log('Enrollment year (number):', enrollmentYear);
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::tfoproject::create_student`,
    arguments: [
      tx.object(CONTRACTS.ADMIN_CAP),
      tx.object(CONTRACTS.REGISTRY),
      tx.pure.string(String(studentData.id)),
      tx.pure.string(String(studentData.name)),
      tx.pure.string(String(studentData.email)),
      tx.pure.string(String(studentData.major)),
      tx.pure.u64(enrollmentYear),
    ],
  });

  console.log('Transaction prepared, executing...');
  console.log('AdminCap ID:', CONTRACTS.ADMIN_CAP);
  console.log('Registry ID:', CONTRACTS.REGISTRY);
  
  try {
    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    console.log('Transaction successful:', result);
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Thêm điểm
export async function addGrade(
  signAndExecuteTransactionBlock,
  gradeData,
  recipientAddress
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::student_management::add_grade`,
    arguments: [
      tx.object(CONTRACTS.ADMIN_CAP),
      tx.pure(gradeData.studentId),
      tx.pure(gradeData.courseCode),
      tx.pure(gradeData.courseName),
      tx.pure(gradeData.credits),
      tx.pure(Math.floor(gradeData.grade * 10)), // Convert to u64
      tx.pure(gradeData.semester),
      tx.pure(2024), // year
      tx.pure(recipientAddress),
    ],
  });

  return await signAndExecuteTransactionBlock({
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });
}

// Cấp chứng chỉ
export async function issueCertificate(
  signAndExecuteTransactionBlock,
  certData
) {
  console.log('Issuing certificate with data:', certData);
  
  const tx = new Transaction();
  
  // Convert date string to Unix timestamp (seconds)
  const timestamp = Math.floor(new Date(certData.date).getTime() / 1000);
  
  console.log('Certificate timestamp:', timestamp);
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::tfoproject::issue_certificate`,
    arguments: [
      tx.object(CONTRACTS.ADMIN_CAP),
      tx.pure.string(String(certData.studentId)),
      tx.pure.string(String(certData.name)),
      tx.pure.string(String(certData.issuedBy)),
      tx.pure.u64(timestamp),
      tx.pure.string(String(certData.description || '')),
      tx.pure.address(certData.recipient),
    ],
  });

  console.log('Certificate transaction prepared, executing...');

  try {
    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    console.log('Certificate issued successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to issue certificate:', error);
    throw error;
  }
}

// Lấy thông tin sinh viên
export async function getStudentProfile(objectId) {
  return await suiClient.getObject({
    id: objectId,
    options: {
      showContent: true,
      showType: true,
    },
  });
}

// Lấy events từ blockchain
export async function getStudentEvents() {
  try {
    const events = await suiClient.queryEvents({
      query: {
        MoveEventModule: {
          package: CONTRACTS.PACKAGE_ID,
          module: 'tfoproject',
        },
      },
      order: 'descending',
      limit: 100,
    });
    
    console.log('Fetched events:', events);
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: [] };
  }
}

// Parse events thành danh sách students
export async function fetchStudentsFromBlockchain() {
  try {
    const events = await getStudentEvents();
    const students = [];
    
    // Lọc StudentCreated events
    events.data.forEach(event => {
      if (event.type.includes('StudentCreated')) {
        const parsedData = event.parsedJson;
        students.push({
          id: parsedData.student_id,
          name: parsedData.name,
          profileAddress: parsedData.profile_address,
        });
      }
    });
    
    console.log('Parsed students from blockchain:', students);
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

// Parse certificates từ events
export async function fetchCertificatesFromBlockchain() {
  try {
    const events = await getStudentEvents();
    const certificates = [];
    
    // Lọc CertificateIssued events
    events.data.forEach(event => {
      if (event.type.includes('CertificateIssued')) {
        const parsedData = event.parsedJson;
        certificates.push({
          studentId: parsedData.student_id,
          name: parsedData.certificate_name,
        });
      }
    });
    
    console.log('Parsed certificates from blockchain:', certificates);
    return certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
}

// Lấy thông tin Registry
export async function getRegistryInfo() {
  try {
    const registryObject = await suiClient.getObject({
      id: CONTRACTS.REGISTRY,
      options: {
        showContent: true,
        showType: true,
      },
    });
    
    console.log('Registry info:', registryObject);
    return registryObject;
  } catch (error) {
    console.error('Error fetching registry:', error);
    return null;
  }
}
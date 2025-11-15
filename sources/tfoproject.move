module tfoproject::tfoproject {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{TxContext};
    use std::string::String;
    use sui::table::{Self, Table};
    use sui::event;

    // ============= Error Codes =============
    const ENotAuthorized: u64 = 1;
    const EStudentNotFound: u64 = 2;
    const EInvalidScore: u64 = 3;
    const ECourseNotFound: u64 = 4;

    // ============= Structs =============
    
    /// Đối tượng quản trị viên hệ thống
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Hồ sơ sinh viên
    public struct StudentProfile has key, store {
        id: UID,
        student_id: String,
        name: String,
        email: String,
        major: String,
        enrollment_year: u64,
        gpa: u64, // GPA * 100 (ví dụ: 3.75 = 375)
        total_credits: u64,
        is_active: bool,
    }

    /// Điểm số của sinh viên trong một môn học
    public struct CourseGrade has key, store {
        id: UID,
        student_id: String,
        course_code: String,
        course_name: String,
        credits: u64,
        grade: u64, // Điểm * 10 (ví dụ: 8.5 = 85)
        semester: String,
        year: u64,
    }

    /// Chứng chỉ/Thành tích
    public struct Certificate has key, store {
        id: UID,
        student_id: String,
        certificate_name: String,
        issued_by: String,
        issue_date: u64,
        description: String,
    }

    /// Registry chứa tất cả sinh viên
    public struct StudentRegistry has key {
        id: UID,
        students: Table<String, address>, // student_id -> StudentProfile address
        total_students: u64,
    }

    // ============= Events =============
    
    public struct StudentCreated has copy, drop {
        student_id: String,
        name: String,
        profile_address: address,
    }

    public struct GradeAdded has copy, drop {
        student_id: String,
        course_code: String,
        grade: u64,
    }

    public struct CertificateIssued has copy, drop {
        student_id: String,
        certificate_name: String,
    }

    // ============= Initialize =============
    
    fun init(ctx: &mut TxContext) {
        // Tạo AdminCap cho người deploy contract
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));

        // Tạo Student Registry
        let registry = StudentRegistry {
            id: object::new(ctx),
            students: table::new(ctx),
            total_students: 0,
        };
        transfer::share_object(registry);
    }

    // ============= Admin Functions =============
    
    /// Tạo hồ sơ sinh viên mới (chỉ admin)
    public entry fun create_student(
        _admin: &AdminCap,
        registry: &mut StudentRegistry,
        student_id: String,
        name: String,
        email: String,
        major: String,
        enrollment_year: u64,
        ctx: &mut TxContext
    ) {
        let profile = StudentProfile {
            id: object::new(ctx),
            student_id: student_id,
            name: name,
            email: email,
            major: major,
            enrollment_year: enrollment_year,
            gpa: 0,
            total_credits: 0,
            is_active: true,
        };

        let profile_address = object::id_address(&profile);
        
        // Thêm vào registry
        table::add(&mut registry.students, student_id, profile_address);
        registry.total_students = registry.total_students + 1;

        // Emit event
        event::emit(StudentCreated {
            student_id: student_id,
            name: name,
            profile_address: profile_address,
        });

        // Transfer ownership to student
        transfer::transfer(profile, tx_context::sender(ctx));
    }

    /// Thêm điểm số cho sinh viên
    public entry fun add_grade(
        _admin: &AdminCap,
        student_id: String,
        course_code: String,
        course_name: String,
        credits: u64,
        grade: u64,
        semester: String,
        year: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(grade <= 100, EInvalidScore);

        let course_grade = CourseGrade {
            id: object::new(ctx),
            student_id: student_id,
            course_code: course_code,
            course_name: course_name,
            credits: credits,
            grade: grade,
            semester: semester,
            year: year,
        };

        event::emit(GradeAdded {
            student_id: student_id,
            course_code: course_code,
            grade: grade,
        });

        transfer::transfer(course_grade, recipient);
    }

    /// Cấp chứng chỉ cho sinh viên
    public entry fun issue_certificate(
        _admin: &AdminCap,
        student_id: String,
        certificate_name: String,
        issued_by: String,
        issue_date: u64,
        description: String,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let certificate = Certificate {
            id: object::new(ctx),
            student_id: student_id,
            certificate_name: certificate_name,
            issued_by: issued_by,
            issue_date: issue_date,
            description: description,
        };

        event::emit(CertificateIssued {
            student_id: student_id,
            certificate_name: certificate_name,
        });

        transfer::transfer(certificate, recipient);
    }

    /// Cập nhật GPA của sinh viên
    public entry fun update_gpa(
        _admin: &AdminCap,
        profile: &mut StudentProfile,
        new_gpa: u64,
        new_credits: u64,
    ) {
        assert!(new_gpa <= 400, EInvalidScore); // Max GPA is 4.00
        profile.gpa = new_gpa;
        profile.total_credits = new_credits;
    }

    /// Cập nhật trạng thái sinh viên
    public entry fun update_student_status(
        _admin: &AdminCap,
        profile: &mut StudentProfile,
        is_active: bool,
    ) {
        profile.is_active = is_active;
    }

    // ============= View Functions =============
    
    /// Lấy thông tin sinh viên
    public fun get_student_info(profile: &StudentProfile): (String, String, String, u64, u64, u64, bool) {
        (
            profile.student_id,
            profile.name,
            profile.major,
            profile.enrollment_year,
            profile.gpa,
            profile.total_credits,
            profile.is_active
        )
    }

    /// Lấy thông tin điểm số
    public fun get_grade_info(grade: &CourseGrade): (String, String, u64, u64) {
        (
            grade.course_code,
            grade.course_name,
            grade.credits,
            grade.grade
        )
    }

    /// Lấy thông tin chứng chỉ
    public fun get_certificate_info(cert: &Certificate): (String, String, u64) {
        (
            cert.certificate_name,
            cert.issued_by,
            cert.issue_date
        )
    }

    /// Lấy tổng số sinh viên
    public fun get_total_students(registry: &StudentRegistry): u64 {
        registry.total_students
    }

    // ============= Test Functions =============
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
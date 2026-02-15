package com.edu.edupage.controller;

import com.edu.edupage.entity.*;
import com.edu.edupage.exception.ResourceNotFoundException;
import com.edu.edupage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminController {

        private final UserRepository userRepository;
        private final StudentRepository studentRepository;
        private final TeacherRepository teacherRepository;
        private final ClassGroupRepository classGroupRepository;
        private final SubjectRepository subjectRepository;

        @GetMapping("/users")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<UserDTO>> getAllUsers() {
                return ResponseEntity.ok(
                                userRepository.findAll().stream()
                                                .map(this::mapToUserDTO)
                                                .collect(Collectors.toList()));
        }

        @GetMapping("/students")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<StudentDTO>> getAllStudents() {
                return ResponseEntity.ok(
                                studentRepository.findAll().stream()
                                                .map(this::mapToStudentDTO)
                                                .collect(Collectors.toList()));
        }

        @GetMapping("/students/class/{classGroupId}")
        @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
        public ResponseEntity<List<StudentDTO>> getStudentsByClass(@PathVariable Long classGroupId) {
                return ResponseEntity.ok(
                                studentRepository.findByClassGroupId(classGroupId).stream()
                                                .map(this::mapToStudentDTO)
                                                .collect(Collectors.toList()));
        }

        @GetMapping("/students/unassigned")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<StudentDTO>> getUnassignedStudents() {
                return ResponseEntity.ok(
                                studentRepository.findAll().stream()
                                                .filter(s -> s.getClassGroup() == null)
                                                .map(this::mapToStudentDTO)
                                                .collect(Collectors.toList()));
        }

        @PutMapping("/students/{studentId}/class")
        @PreAuthorize("hasRole('ADMIN')")
        @Transactional
        public ResponseEntity<StudentDTO> updateStudentClass(
                        @PathVariable Long studentId,
                        @RequestBody UpdateStudentClassRequest request) {
                Student student = studentRepository.findById(studentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

                if (request.classGroupId() != null) {
                        ClassGroup classGroup = classGroupRepository.findById(request.classGroupId())
                                        .orElseThrow(() -> new ResourceNotFoundException("ClassGroup", "id",
                                                        request.classGroupId()));
                        student.setClassGroup(classGroup);
                } else {
                        student.setClassGroup(null);
                }

                student = studentRepository.save(student);
                return ResponseEntity.ok(mapToStudentDTO(student));
        }

        @PutMapping("/students/bulk-assign")
        @PreAuthorize("hasRole('ADMIN')")
        @Transactional
        public ResponseEntity<List<StudentDTO>> bulkAssignStudentsToClass(@RequestBody BulkAssignRequest request) {
                ClassGroup finalClassGroup = null;
                if (request.classGroupId() != null) {
                        finalClassGroup = classGroupRepository.findById(request.classGroupId())
                                        .orElseThrow(() -> new ResourceNotFoundException("ClassGroup", "id",
                                                        request.classGroupId()));
                }

                final ClassGroup classGroup = finalClassGroup;
                List<Student> students = request.studentIds().stream()
                                .map(id -> studentRepository.findById(id)
                                                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id)))
                                .peek(s -> s.setClassGroup(classGroup))
                                .map(studentRepository::save)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(students.stream().map(this::mapToStudentDTO).collect(Collectors.toList()));
        }

        @GetMapping("/teachers")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
                return ResponseEntity.ok(
                                teacherRepository.findAll().stream()
                                                .map(this::mapToTeacherDTO)
                                                .collect(Collectors.toList()));
        }

        @PutMapping("/teachers/{teacherId}/subjects")
        @PreAuthorize("hasRole('ADMIN')")
        @Transactional
        public ResponseEntity<TeacherDTO> updateTeacherSubjects(
                        @PathVariable Long teacherId,
                        @RequestBody UpdateTeacherSubjectsRequest request) {
                Teacher teacher = teacherRepository.findById(teacherId)
                                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));

                Set<Subject> subjects = request.subjectIds().stream()
                                .map(id -> subjectRepository.findById(id)
                                                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id)))
                                .collect(Collectors.toSet());

                teacher.setSubjects(subjects);
                teacher = teacherRepository.save(teacher);
                return ResponseEntity.ok(mapToTeacherDTO(teacher));
        }

        @GetMapping("/class-groups")
        @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
        public ResponseEntity<List<ClassGroupDTO>> getAllClassGroups() {
                return ResponseEntity.ok(
                                classGroupRepository.findAll().stream()
                                                .map(this::mapToClassGroupDTO)
                                                .collect(Collectors.toList()));
        }

        @PostMapping("/class-groups")
        @PreAuthorize("hasRole('ADMIN')")
        @Transactional
        public ResponseEntity<ClassGroupDTO> createClassGroup(@RequestBody CreateClassGroupRequest request) {
                ClassGroup classGroup = ClassGroup.builder()
                                .name(request.name())
                                .grade(request.grade())
                                .monthlyFee(request.monthlyFee() != null ? request.monthlyFee() : 0)
                                .build();
                classGroup = classGroupRepository.save(classGroup);
                return ResponseEntity.ok(mapToClassGroupDTO(classGroup));
        }

        @PutMapping("/class-groups/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        @Transactional
        public ResponseEntity<ClassGroupDTO> updateClassGroup(
                        @PathVariable Long id,
                        @RequestBody CreateClassGroupRequest request) {
                ClassGroup classGroup = classGroupRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("ClassGroup", "id", id));

                classGroup.setName(request.name());
                classGroup.setGrade(request.grade());
                if (request.monthlyFee() != null) {
                        classGroup.setMonthlyFee(request.monthlyFee());
                }
                classGroup = classGroupRepository.save(classGroup);
                return ResponseEntity.ok(mapToClassGroupDTO(classGroup));
        }

        @DeleteMapping("/class-groups/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        @Transactional
        public ResponseEntity<Void> deleteClassGroup(@PathVariable Long id) {
                ClassGroup classGroup = classGroupRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("ClassGroup", "id", id));

                studentRepository.findByClassGroupId(id).forEach(student -> {
                        student.setClassGroup(null);
                        studentRepository.save(student);
                });

                classGroupRepository.delete(classGroup);
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/subjects")
        @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
        public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
                return ResponseEntity.ok(
                                subjectRepository.findAll().stream()
                                                .map(this::mapToSubjectDTO)
                                                .collect(Collectors.toList()));
        }

        private UserDTO mapToUserDTO(User user) {
                return new UserDTO(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                                user.getRole());
        }

        private StudentDTO mapToStudentDTO(Student student) {
                return new StudentDTO(
                                student.getId(),
                                student.getUser().getId(),
                                student.getUser().getFullName(),
                                student.getUser().getEmail(),
                                student.getClassGroup() != null ? student.getClassGroup().getId() : null,
                                student.getClassGroup() != null ? student.getClassGroup().getName() : null,
                                student.getStudentNumber(),
                                student.getAccountNumber());
        }

        private TeacherDTO mapToTeacherDTO(Teacher teacher) {
                return new TeacherDTO(
                                teacher.getId(),
                                teacher.getUser().getId(),
                                teacher.getUser().getFullName(),
                                teacher.getUser().getEmail(),
                                teacher.getSubjects().stream().map(Subject::getName).collect(Collectors.toList()),
                                teacher.getEmployeeNumber());
        }

        private ClassGroupDTO mapToClassGroupDTO(ClassGroup classGroup) {
                long studentCount = studentRepository.findByClassGroupId(classGroup.getId()).size();
                return new ClassGroupDTO(
                                classGroup.getId(),
                                classGroup.getName(),
                                classGroup.getGrade(),
                                classGroup.getMonthlyFee(),
                                studentCount);
        }

        private SubjectDTO mapToSubjectDTO(Subject subject) {
                return new SubjectDTO(subject.getId(), subject.getName(), subject.getDescription(),
                                subject.getHoursPerWeek());
        }

        public record UserDTO(Long id, String email, String firstName, String lastName, Role role) {
        }

        public record StudentDTO(Long id, Long userId, String name, String email, Long classGroupId,
                        String classGroupName, String studentNumber, String accountNumber) {
        }

        public record TeacherDTO(Long id, Long userId, String name, String email, List<String> subjects,
                        String employeeNumber) {
        }

        public record ClassGroupDTO(Long id, String name, Integer grade, Integer monthlyFee, Long studentCount) {
        }

        public record SubjectDTO(Long id, String name, String description, Integer hoursPerWeek) {
        }

        public record UpdateStudentClassRequest(Long classGroupId) {
        }

        public record BulkAssignRequest(List<Long> studentIds, Long classGroupId) {
        }

        public record CreateClassGroupRequest(String name, Integer grade, Integer monthlyFee) {
        }

        public record CreateSubjectRequest(String name, String description, Integer hoursPerWeek) {
        }

        public record UpdateTeacherSubjectsRequest(List<Long> subjectIds) {
        }
}

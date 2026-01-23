package com.edu.edupage.config;

import com.edu.edupage.entity.*;
import com.edu.edupage.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final StudentRepository studentRepository;
        private final TeacherRepository teacherRepository;
        private final ClassGroupRepository classGroupRepository;
        private final SubjectRepository subjectRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                if (userRepository.count() > 0) {
                        log.info("Database already seeded, skipping...");
                        return;
                }

                log.info("Seeding database with initial data...");

                // Create subjects
                Subject math = subjectRepository.save(Subject.builder()
                                .name("Mathematics")
                                .description("Basic and advanced mathematics")
                                .hoursPerWeek(4)
                                .build());

                Subject physics = subjectRepository.save(Subject.builder()
                                .name("Physics")
                                .description("General physics")
                                .hoursPerWeek(3)
                                .build());

                Subject english = subjectRepository.save(Subject.builder()
                                .name("English")
                                .description("English language and literature")
                                .hoursPerWeek(4)
                                .build());

                Subject history = subjectRepository.save(Subject.builder()
                                .name("History")
                                .description("World history")
                                .hoursPerWeek(2)
                                .build());

                Subject computerScience = subjectRepository.save(Subject.builder()
                                .name("Computer Science")
                                .description("Programming and IT")
                                .hoursPerWeek(3)
                                .build());

                // Create class groups
                ClassGroup class10A = classGroupRepository.save(ClassGroup.builder()
                                .name("10A")
                                .grade(10)
                                .build());

                ClassGroup class10B = classGroupRepository.save(ClassGroup.builder()
                                .name("10B")
                                .grade(10)
                                .build());

                ClassGroup class11A = classGroupRepository.save(ClassGroup.builder()
                                .name("11A")
                                .grade(11)
                                .build());

                // Create admin user
                User adminUser = userRepository.save(User.builder()
                                .email("admin@edupage.com")
                                .password(passwordEncoder.encode("admin123"))
                                .firstName("Admin")
                                .lastName("User")
                                .role(Role.ADMIN)
                                .build());

                // Create teachers
                User teacherUser1 = userRepository.save(User.builder()
                                .email("john.smith@edupage.com")
                                .password(passwordEncoder.encode("teacher123"))
                                .firstName("John")
                                .lastName("Smith")
                                .role(Role.TEACHER)
                                .build());

                Set<Subject> mathPhysicsSubjects = new HashSet<>();
                mathPhysicsSubjects.add(math);
                mathPhysicsSubjects.add(physics);

                teacherRepository.save(Teacher.builder()
                                .user(teacherUser1)
                                .subjects(mathPhysicsSubjects)
                                .employeeNumber("T001")
                                .build());

                User teacherUser2 = userRepository.save(User.builder()
                                .email("jane.doe@edupage.com")
                                .password(passwordEncoder.encode("teacher123"))
                                .firstName("Jane")
                                .lastName("Doe")
                                .role(Role.TEACHER)
                                .build());

                Set<Subject> englishHistorySubjects = new HashSet<>();
                englishHistorySubjects.add(english);
                englishHistorySubjects.add(history);

                teacherRepository.save(Teacher.builder()
                                .user(teacherUser2)
                                .subjects(englishHistorySubjects)
                                .employeeNumber("T002")
                                .build());

                User teacherUser3 = userRepository.save(User.builder()
                                .email("bob.wilson@edupage.com")
                                .password(passwordEncoder.encode("teacher123"))
                                .firstName("Bob")
                                .lastName("Wilson")
                                .role(Role.TEACHER)
                                .build());

                Set<Subject> csSubjects = new HashSet<>();
                csSubjects.add(computerScience);

                teacherRepository.save(Teacher.builder()
                                .user(teacherUser3)
                                .subjects(csSubjects)
                                .employeeNumber("T003")
                                .build());

                // Create students
                User studentUser1 = userRepository.save(User.builder()
                                .email("alice.johnson@edupage.com")
                                .password(passwordEncoder.encode("student123"))
                                .firstName("Alice")
                                .lastName("Johnson")
                                .role(Role.STUDENT)
                                .build());

                studentRepository.save(Student.builder()
                                .user(studentUser1)
                                .classGroup(class10A)
                                .studentNumber("S001")
                                .build());

                User studentUser2 = userRepository.save(User.builder()
                                .email("charlie.brown@edupage.com")
                                .password(passwordEncoder.encode("student123"))
                                .firstName("Charlie")
                                .lastName("Brown")
                                .role(Role.STUDENT)
                                .build());

                studentRepository.save(Student.builder()
                                .user(studentUser2)
                                .classGroup(class10A)
                                .studentNumber("S002")
                                .build());

                User studentUser3 = userRepository.save(User.builder()
                                .email("emma.davis@edupage.com")
                                .password(passwordEncoder.encode("student123"))
                                .firstName("Emma")
                                .lastName("Davis")
                                .role(Role.STUDENT)
                                .build());

                studentRepository.save(Student.builder()
                                .user(studentUser3)
                                .classGroup(class10B)
                                .studentNumber("S003")
                                .build());

                log.info("Database seeded successfully!");
                log.info("Admin: admin@edupage.com / admin123");
                log.info("Teachers: john.smith@edupage.com, jane.doe@edupage.com, bob.wilson@edupage.com / teacher123");
                log.info("Students: alice.johnson@edupage.com, charlie.brown@edupage.com, emma.davis@edupage.com / student123");
        }
}

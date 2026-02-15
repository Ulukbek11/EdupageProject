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
                if (userRepository.count() > 0)
                        return;

                Subject math = subjectRepository.save(
                                Subject.builder().name("Mathematics").description("Maths").hoursPerWeek(4).build());
                Subject physics = subjectRepository
                                .save(Subject.builder().name("Physics").description("Physics").hoursPerWeek(3).build());
                Subject cs = subjectRepository.save(
                                Subject.builder().name("Computer Science").description("IT").hoursPerWeek(3).build());

                ClassGroup class10A = classGroupRepository
                                .save(ClassGroup.builder().name("10A").grade(10).monthlyFee(3000).build());
                ClassGroup class11A = classGroupRepository
                                .save(ClassGroup.builder().name("11A").grade(11).monthlyFee(3500).build());

                userRepository.save(
                                User.builder().email("admin@edupage.com").password(passwordEncoder.encode("admin123"))
                                                .firstName("System").lastName("Admin").role(Role.ADMIN).build());
                userRepository.save(User.builder().email("finance@edupage.com")
                                .password(passwordEncoder.encode("finance123")).firstName("Main").lastName("Accountant")
                                .role(Role.ACCOUNTANT).build());

                User teacherUser1 = userRepository.save(User.builder().email("teacher1@edupage.com")
                                .password(passwordEncoder.encode("teacher123")).firstName("John").lastName("Smith")
                                .role(Role.TEACHER).build());
                Set<Subject> teacherSubjects = new HashSet<>();
                teacherSubjects.add(math);
                teacherSubjects.add(physics);
                teacherRepository.save(Teacher.builder().user(teacherUser1).subjects(teacherSubjects)
                                .employeeNumber("T001").build());

                User studentUser1 = userRepository.save(User.builder().email("student1@edupage.com")
                                .password(passwordEncoder.encode("student123")).firstName("Alice").lastName("Johnson")
                                .role(Role.STUDENT).build());
                studentRepository.save(Student.builder().user(studentUser1).classGroup(class10A).studentNumber("S001")
                                .accountNumber("10000001").build());

                log.info("Database seeded successfully");
        }
}

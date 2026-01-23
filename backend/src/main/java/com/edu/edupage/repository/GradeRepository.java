package com.edu.edupage.repository;

import com.edu.edupage.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudentId(Long studentId);

    List<Grade> findByStudentIdAndSubjectId(Long studentId, Long subjectId);

    List<Grade> findByTeacherId(Long teacherId);

    @Query("SELECT g FROM Grade g WHERE g.student.id = :studentId ORDER BY g.date DESC")
    List<Grade> findByStudentIdOrderByDateDesc(@Param("studentId") Long studentId);

    @Query("SELECT AVG(g.value) FROM Grade g WHERE g.student.id = :studentId AND g.subject.id = :subjectId")
    Double findAverageByStudentAndSubject(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);
}

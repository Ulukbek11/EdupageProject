package com.edu.edupage.repository;

import com.edu.edupage.entity.Announcement;
import com.edu.edupage.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE " +
            "(a.targetRole IS NULL OR a.targetRole = :role) AND " +
            "(a.targetClassGroup IS NULL OR a.targetClassGroup.id = :classGroupId) AND " +
            "a.publishedAt <= :now AND " +
            "(a.expiresAt IS NULL OR a.expiresAt > :now) " +
            "ORDER BY a.important DESC, a.publishedAt DESC")
    List<Announcement> findActiveAnnouncementsForStudent(
            @Param("role") Role role,
            @Param("classGroupId") Long classGroupId,
            @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Announcement a WHERE " +
            "(a.targetRole IS NULL OR a.targetRole = :role) AND " +
            "a.publishedAt <= :now AND " +
            "(a.expiresAt IS NULL OR a.expiresAt > :now) " +
            "ORDER BY a.important DESC, a.publishedAt DESC")
    List<Announcement> findActiveAnnouncementsForRole(
            @Param("role") Role role,
            @Param("now") LocalDateTime now);

    List<Announcement> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT a FROM Announcement a ORDER BY a.important DESC, a.publishedAt DESC")
    List<Announcement> findAllOrderByImportanceAndDate();
}

package com.auraday.repository;

import com.auraday.entity.Friendship;
import com.auraday.entity.User;
import com.auraday.entity.enums.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    Optional<Friendship> findByUserIdAndFriendId(Long userId, Long friendId);

    List<Friendship> findByUserIdAndStatus(Long userId, FriendshipStatus status);

    List<Friendship> findByFriendIdAndStatus(Long friendId, FriendshipStatus status);

    boolean existsByUserIdAndFriendIdAndStatus(Long userId, Long friendId, FriendshipStatus status);

    @Query("SELECT u FROM User u WHERE u.id IN (" +
           "  SELECT f.friend.id FROM Friendship f WHERE f.user.id = :userId AND f.status = 'ACCEPTED'" +
           ") OR u.id IN (" +
           "  SELECT f.user.id FROM Friendship f WHERE f.friend.id = :userId AND f.status = 'ACCEPTED'" +
           ")")
    List<User> findAllAcceptedFriends(@Param("userId") Long userId);

    @Query("SELECT COUNT(f) > 0 FROM Friendship f " +
           "WHERE ((f.user.id = :u1 AND f.friend.id = :u2) OR (f.user.id = :u2 AND f.friend.id = :u1)) " +
           "AND f.status = 'ACCEPTED'")
    boolean areFriends(@Param("u1") Long userId1, @Param("u2") Long userId2);

    @Query("SELECT COUNT(f) FROM Friendship f " +
           "WHERE (f.user.id = :userId OR f.friend.id = :userId) AND f.status = 'ACCEPTED'")
    long countAcceptedFriends(@Param("userId") Long userId);
}

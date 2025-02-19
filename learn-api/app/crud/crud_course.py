from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.base_task import BaseTask
from app.models.course import Course
from app.models.course_members import CourseMembers
from app.models.task import Task
from app.schemas.course import CourseAdmin, CourseCreate, CourseDetail, CourseUpdate


def set_member_status(*, courses: List[Course], user_id: str) -> None:
    for course in courses:
        for member in course.members:
            if member.id == user_id:
                course.is_member = True


class CRUDCourse(CRUDBase[Course, CourseCreate, CourseUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: CourseCreate, owner_id: int
    ) -> Course:
        """
        Creates a new course with the given user as owner.

        :param db: DB-Session
        :param obj_in: contains all information to create the course
        :param owner_id: Id of the course owner
        :return: The created Course
        """
        db_obj = Course()
        db_obj.name = obj_in.name
        db_obj.owner_id = owner_id
        db_obj.description = obj_in.description
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def join_course(
        self, db: Session, *, short_name: str, user_id: str
    ) -> Optional[Course]:
        """
        Join the given course.

        :param db: DB-Session
        :param short_name: Shortname of the Course
        :param user_id: id of the user
        :return: The joined Course
        """
        course = db.query(self.model).filter(Course.short_name == short_name).first()

        exists = (
            db.query(CourseMembers)
            .filter(
                CourseMembers.course_id == course.id, CourseMembers.user_id == user_id
            )
            .first()
        )
        if exists:
            return None

        db_obj = CourseMembers()
        db_obj.user_id = user_id
        db_obj.course_id = course.id
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return course

    def leave_course(self, db: Session, *, course_id: int, user_id: str) -> None:
        """
        Lets user leave a course

        :param db: DB-Session
        :param course_id: Id of the course
        :param user_id: Id of the user
        """
        membership = (
            db.query(self.model)
            .filter(self.model.course_id == course_id)
            .filter(self.model.user_id == user_id)
            .first()
        )
        db.delete(membership)
        db.commit()

    def get_multi_by_owner(self, db: Session, *, owner_id: int) -> List[CourseAdmin]:
        """
        Returns all courses where the given user is the owner.

        :param db: DB-Session
        :param owner_id: id of the owner
        :return: All Courses of the owner
        """
        return db.query(self.model).filter(Course.owner_id == owner_id).all()

    def get_multi_by_user(self, db: Session, *, user_id: str) -> List[CourseDetail]:
        """
        Returns all Courses where the user is a member.

        :param db: DB-Session
        :param user_id: id of the user
        :return: All Courses where user is member
        """
        return db.query(self.model).join(self.model.members).filter_by(id=user_id).all()

    def get_by_short_name(self, db: Session, *, short_name: str) -> CourseDetail:
        """
        Returns the Course to the given shortname.

        :param db: DB-Session
        :param short_name: Shortname of the course
        :return: Course to the shortname
        """

        return db.query(self.model).filter(Course.short_name == short_name).first()

    def get_by_name(self, db: Session, *, name: str) -> Course:
        """
        Return Course by name.

        :param db: DB-Session
        :param name: Name of Course
        :return: The found Course
        """
        return db.query(self.model).filter(Course.name == name).first()

    def get_multi_by_name(
        self, db: Session, *, search: str, user_id: str
    ) -> List[Course]:
        """
        Returns all Courses where the name contains the search string

        :param db: DB-Session
        :param search: string that should be contained in the name
        :param user_id: id of the user
        :return: All Courses where search string is included
        """
        courses = (
            db.query(self.model)
            .filter(self.model.name.ilike("%{0}%".format(search)))
            .all()
        )
        set_member_status(courses=courses, user_id=user_id)
        return courses

    def is_not_member_and_owner(self, db, course_id: int, user_id: str) -> bool:
        """
        Checks if User is Member or Owner.

        :param db: DB-Session
        :param course_id: Id of the Course
        :param user_id: Id of the user
        :return: Not Member and Owner
        """
        course = self.get(db, id=course_id)
        is_member = False
        for member in course.members:
            if member.id == user_id:
                is_member = True

        is_owner = course.owner.id == user_id
        return is_member is False and is_owner is False

    def user_is_course_owner(self, db, *, course_id: int, user_id: str) -> bool:
        course = self.get(db, id=course_id)

        # if not course:
        #     return False

        return course.owner_id == user_id

    def get_members(self, db: Session, *, course_id: int) -> List:
        return self.get(db, id=course_id).members

    def get_task_count(self, db: Session, *, course_id: int) -> int:
        result = (
            db.query(Task.id)
            .select_from(Course)
            .join(BaseTask, Course.id == BaseTask.course_id)
            .join(Task, Task.base_task_id == BaseTask.id)
            .filter(Course.id == course_id)
            .count()
        )
        return result


crud_course = CRUDCourse(Course)

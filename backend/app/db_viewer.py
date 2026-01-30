#!/usr/bin/env python3
"""
SafeZonePH Database Viewer
Run this script to view all database contents
Usage: python db_viewer.py
"""

import os
import sys
from datetime import datetime
from tabulate import tabulate

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from main import engine, User, Task, PointsHistory, HelpRequest, GlobalAlert, CommunityTask, BuddySession, Notification
    from sqlalchemy.orm import sessionmaker
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running from the backend/app directory")
    sys.exit(1)

def create_session():
    Session = sessionmaker(bind=engine)
    return Session()

def format_datetime(dt):
    if dt:
        return dt.strftime("%Y-%m-%d %H:%M")
    return "N/A"

def view_users(db):
    users = db.query(User).all()
    print("\n" + "="*80)
    print("👥 USERS")
    print("="*80)
    
    if not users:
        print("No users found.")
        return
    
    data = []
    for u in users:
        data.append([
            u.id,
            u.email,
            f"{u.first_name} {u.last_name}",
            u.points,
            u.rank,
            "✓" if u.is_verified else "✗",
            format_datetime(u.created_at)
        ])
    
    headers = ["ID", "Email", "Name", "Points", "Rank", "Verified", "Created"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    print(f"\nTotal: {len(users)} users")

def view_tasks(db):
    tasks = db.query(Task).all()
    print("\n" + "="*80)
    print("📋 TASKS")
    print("="*80)
    
    if not tasks:
        print("No tasks found.")
        return
    
    data = []
    for t in tasks:
        data.append([
            t.id,
            t.title[:30] + "..." if len(t.title) > 30 else t.title,
            t.category,
            t.priority,
            t.status,
            t.points,
            t.created_by,
            format_datetime(t.created_at)
        ])
    
    headers = ["ID", "Title", "Category", "Priority", "Status", "Points", "User ID", "Created"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    print(f"\nTotal: {len(tasks)} tasks")

def view_points_history(db):
    history = db.query(PointsHistory).order_by(PointsHistory.created_at.desc()).all()
    print("\n" + "="*80)
    print("⭐ POINTS HISTORY")
    print("="*80)
    
    if not history:
        print("No points history found.")
        return
    
    data = []
    for h in history:
        # Get user info
        user = db.query(User).filter(User.id == h.user_id).first()
        user_name = f"{user.first_name} {user.last_name}" if user else f"User #{h.user_id}"
        
        data.append([
            h.id,
            user_name,
            h.type,
            h.description[:40] + "..." if len(h.description) > 40 else h.description,
            f"+{h.points}" if h.points > 0 else str(h.points),
            format_datetime(h.created_at)
        ])
    
    headers = ["ID", "User", "Type", "Description", "Points", "Date"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    print(f"\nTotal: {len(history)} entries")

def view_help_requests(db):
    requests = db.query(HelpRequest).order_by(HelpRequest.created_at.desc()).all()
    print("\n" + "="*80)
    print("🆘 HELP REQUESTS")
    print("="*80)
    
    if not requests:
        print("No help requests found.")
        return
    
    data = []
    for r in requests:
        data.append([
            r.id,
            r.user_name,
            r.type,
            r.title[:25] + "..." if len(r.title) > 25 else r.title,
            r.urgency,
            r.status,
            f"{r.responders_count}/{r.responders_needed}",
            format_datetime(r.created_at)
        ])
    
    headers = ["ID", "User", "Type", "Title", "Urgency", "Status", "Responders", "Created"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    print(f"\nTotal: {len(requests)} requests")

def view_global_alerts(db):
    alerts = db.query(GlobalAlert).order_by(GlobalAlert.created_at.desc()).all()
    print("\n" + "="*80)
    print("🚨 GLOBAL ALERTS")
    print("="*80)
    
    if not alerts:
        print("No global alerts found.")
        return
    
    data = []
    for a in alerts:
        data.append([
            a.id,
            a.created_by,
            a.type,
            a.priority,
            a.title[:25] + "..." if len(a.title) > 25 else a.title,
            "Active" if a.is_active else "Inactive",
            format_datetime(a.created_at)
        ])
    
    headers = ["ID", "Created By", "Type", "Priority", "Title", "Status", "Created"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    print(f"\nTotal: {len(alerts)} alerts")

def view_community_tasks(db):
    tasks = db.query(CommunityTask).order_by(CommunityTask.created_at.desc()).all()
    print("\n" + "="*80)
    print("🤝 COMMUNITY TASKS")
    print("="*80)
    
    if not tasks:
        print("No community tasks found.")
        return
    
    data = []
    for t in tasks:
        import json
        volunteers = json.loads(t.volunteers) if t.volunteers else []
        data.append([
            t.id,
            t.title[:30] + "..." if len(t.title) > 30 else t.title,
            t.location[:20] + "..." if len(t.location) > 20 else t.location,
            t.urgency,
            t.status,
            t.points,
            len(volunteers),
            format_datetime(t.created_at)
        ])
    
    headers = ["ID", "Title", "Location", "Urgency", "Status", "Points", "Volunteers", "Created"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    print(f"\nTotal: {len(tasks)} community tasks")

def view_buddy_sessions(db):
    sessions = db.query(BuddySession).order_by(BuddySession.created_at.desc()).all()
    print("\n" + "="*80)
    print("👥 BUDDY SESSIONS")
    print("="*80)
    
    if not sessions:
        print("No buddy sessions found.")
        return
    
    data = []
    for s in sessions:
        user = db.query(User).filter(User.id == s.user_id).first()
        buddy = db.query(User).filter(User.id == s.buddy_id).first()
        user_name = f"{user.first_name}" if user else f"#{s.user_id}"
        buddy_name = f"{buddy.first_name}" if buddy else f"#{s.buddy_id}"
        
        data.append([
            s.id,
            user_name,
            buddy_name,
            s.status,
            f"{s.check_in_interval}min",
            format_datetime(s.last_check_in),
            s.location[:15] + "..." if s.location and len(s.location) > 15 else (s.location or "N/A"),
            format_datetime(s.created_at)
        ])
    
    headers = ["ID", "User", "Buddy", "Status", "Interval", "Last Check-in", "Location", "Created"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    print(f"\nTotal: {len(sessions)} buddy sessions")

def view_notifications(db):
    notifications = db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()
    print("\n" + "="*80)
    print("🔔 NOTIFICATIONS (Latest 20)")
    print("="*80)
    
    if not notifications:
        print("No notifications found.")
        return
    
    data = []
    for n in notifications:
        user = db.query(User).filter(User.id == n.user_id).first()
        user_name = f"{user.first_name}" if user else f"#{n.user_id}"
        
        data.append([
            n.id,
            user_name,
            n.type,
            n.title[:25] + "..." if len(n.title) > 25 else n.title,
            "✓" if n.is_read else "✗",
            format_datetime(n.created_at)
        ])
    
    headers = ["ID", "User", "Type", "Title", "Read", "Created"]
    print(tabulate(data, headers=headers, tablefmt="rounded_grid"))
    
    total = db.query(Notification).count()
    unread = db.query(Notification).filter(Notification.is_read == False).count()
    print(f"\nTotal: {total} notifications ({unread} unread)")

def view_summary(db):
    print("\n" + "="*80)
    print("📊 DATABASE SUMMARY")
    print("="*80)
    
    users_count = db.query(User).count()
    tasks_count = db.query(Task).count()
    points_count = db.query(PointsHistory).count()
    help_count = db.query(HelpRequest).count()
    alerts_count = db.query(GlobalAlert).count()
    community_count = db.query(CommunityTask).count()
    buddy_count = db.query(BuddySession).count()
    notif_count = db.query(Notification).count()
    
    data = [
        ["👥 Users", users_count],
        ["📋 Tasks", tasks_count],
        ["⭐ Points History Entries", points_count],
        ["🆘 Help Requests", help_count],
        ["🚨 Global Alerts", alerts_count],
        ["🤝 Community Tasks", community_count],
        ["👥 Buddy Sessions", buddy_count],
        ["🔔 Notifications", notif_count],
    ]
    
    print(tabulate(data, headers=["Table", "Count"], tablefmt="rounded_grid"))
    
    # Show total points distributed
    from sqlalchemy import func
    total = db.query(func.sum(User.points)).scalar() or 0
    print(f"\n💰 Total points in circulation: {total}")

def main():
    print("\n" + "🔐"*20)
    print("   SafeZonePH Database Viewer")
    print("🔐"*20)
    
    db = create_session()
    
    try:
        while True:
            print("\n" + "-"*40)
            print("Select what to view:")
            print("-"*40)
            print("1. Summary")
            print("2. Users")
            print("3. Tasks")
            print("4. Points History")
            print("5. Help Requests")
            print("6. Global Alerts")
            print("7. Community Tasks")
            print("8. Buddy Sessions")
            print("9. Notifications")
            print("A. View All")
            print("0. Exit")
            print("-"*40)
            
            choice = input("\nEnter choice (0-9, A): ").strip().upper()
            
            if choice == "0":
                print("\n👋 Goodbye!")
                break
            elif choice == "1":
                view_summary(db)
            elif choice == "2":
                view_users(db)
            elif choice == "3":
                view_tasks(db)
            elif choice == "4":
                view_points_history(db)
            elif choice == "5":
                view_help_requests(db)
            elif choice == "6":
                view_global_alerts(db)
            elif choice == "7":
                view_community_tasks(db)
            elif choice == "8":
                view_buddy_sessions(db)
            elif choice == "9":
                view_notifications(db)
            elif choice == "A":
                view_summary(db)
                view_users(db)
                view_tasks(db)
                view_points_history(db)
                view_help_requests(db)
                view_global_alerts(db)
                view_community_tasks(db)
                view_buddy_sessions(db)
                view_notifications(db)
            else:
                print("Invalid choice. Please try again.")
    
    finally:
        db.close()

if __name__ == "__main__":
    main()

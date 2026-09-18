import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_and_note_flow(client: AsyncClient):
    # 1. Register User
    reg_res = await client.post("/api/v1/auth/register", json={
        "email": "test@nexus.workspace",
        "password": "SecurePassword123!",
        "full_name": "Test User"
    })
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == "test@nexus.workspace"

    # 2. Login User
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "test@nexus.workspace",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    access_token = token_data["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    # 3. List Workspaces
    ws_res = await client.get("/api/v1/workspaces/", headers=headers)
    assert ws_res.status_code == 200
    workspaces = ws_res.json()
    assert len(workspaces) > 0
    workspace_id = workspaces[0]["id"]
    headers["X-Workspace-Id"] = workspace_id

    # 4. Create Note
    create_note_res = await client.post("/api/v1/notes/", json={
        "title": "Architecture Design Note",
        "content": "<p>NEXUS WORKSPACE clean architecture specification.</p>",
        "tags": ["architecture", "backend"],
        "is_favorite": True
    }, headers=headers)
    assert create_note_res.status_code == 201
    note = create_note_res.json()
    assert note["title"] == "Architecture Design Note"
    assert note["is_favorite"] is True
    assert "architecture" in note["tags"]
    note_id = note["id"]

    # 5. List Notes
    list_notes_res = await client.get("/api/v1/notes/", headers=headers)
    assert list_notes_res.status_code == 200
    notes_list = list_notes_res.json()
    assert len(notes_list) == 1

    # 6. Update Note (Autosave payload)
    update_res = await client.put(f"/api/v1/notes/{note_id}", json={
        "title": "Updated Architecture Design Note",
        "content": "<p>Updated content with Autosave.</p>"
    }, headers=headers)
    assert update_res.status_code == 200
    updated_note = update_res.json()
    assert updated_note["title"] == "Updated Architecture Design Note"

    # 7. Soft Delete Note
    delete_res = await client.delete(f"/api/v1/notes/{note_id}", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json()["is_deleted"] is True

    # 8. Verify note excluded from default active list
    active_res = await client.get("/api/v1/notes/", headers=headers)
    assert len(active_res.json()) == 0


@pytest.mark.asyncio
async def test_uuid_generator_utility(client: AsyncClient):
    res = await client.post("/api/v1/it-tools/uuid/generate", json={
        "version": "v4",
        "quantity": 3,
        "uppercase": True,
        "hyphenated": True
    })
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 3
    assert len(data["uuids"]) == 3
    for u in data["uuids"]:
        assert "-" in u
        assert u.isupper()


@pytest.mark.asyncio
async def test_problem_ticket_flow(client: AsyncClient):
    # Register & Login
    await client.post("/api/v1/auth/register", json={
        "email": "issue@nexus.workspace",
        "password": "SecurePassword123!",
        "full_name": "Issue User"
    })
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "issue@nexus.workspace",
        "password": "SecurePassword123!"
    })
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Create Ticket with Category and Image URL
    create_res = await client.post("/api/v1/problems/", json={
        "ticket_number": "TKT-9999",
        "title": "API Rate Limit Exceeded",
        "description": "Rate limit triggered during batch import.",
        "category": "Backend & API",
        "image_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "status": "open",
        "priority": "critical"
    }, headers=headers)
    assert create_res.status_code == 201
    ticket = create_res.json()
    assert ticket["ticket_number"] == "TKT-9999"
    assert ticket["category"] == "Backend & API"
    assert "data:image/png" in ticket["image_url"]

    ticket_id = ticket["id"]

    # Update Ticket with Solution when Resolved
    update_res = await client.put(f"/api/v1/problems/{ticket_id}", json={
        "status": "resolved",
        "solution": "Increased Redis token bucket capacity to 500 req/min and implemented exponential backoff."
    }, headers=headers)
    assert update_res.status_code == 200
    updated_ticket = update_res.json()
    assert updated_ticket["status"] == "resolved"
    assert "Redis token bucket" in updated_ticket["solution"]

    # List Tickets
    list_res = await client.get("/api/v1/problems/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


@pytest.mark.asyncio
async def test_task_kanban_flow(client: AsyncClient):
    # Register & Login
    await client.post("/api/v1/auth/register", json={
        "email": "task@nexus.workspace",
        "password": "SecurePassword123!",
        "full_name": "Task User"
    })
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "task@nexus.workspace",
        "password": "SecurePassword123!"
    })
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Create Kanban Task
    create_res = await client.post("/api/v1/tasks/", json={
        "title": "Implement Daily Activity Log",
        "description": "Snapshot daily kanban progress into historical log menu.",
        "status": "in_progress",
        "priority": "high"
    }, headers=headers)
    assert create_res.status_code == 201
    task = create_res.json()
    assert task["title"] == "Implement Daily Activity Log"
    assert task["status"] == "in_progress"

    task_id = task["id"]

    # Move Task Status to Done
    update_res = await client.put(f"/api/v1/tasks/{task_id}", json={
        "status": "done"
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "done"

    # List Tasks
    list_res = await client.get("/api/v1/tasks/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


@pytest.mark.asyncio
async def test_presentation_deck_flow(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "slide@nexus.workspace",
        "password": "SecurePassword123!",
        "full_name": "Slide User"
    })
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "slide@nexus.workspace",
        "password": "SecurePassword123!"
    })
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    ws_res = await client.get("/api/v1/workspaces/", headers=headers)
    headers["X-Workspace-Id"] = ws_res.json()[0]["id"]

    create_res = await client.post("/api/v1/presentations/", json={
        "title": "Quarterly Product Deck",
        "description": "Canva slide deck with custom elements",
        "slides_json": '[{"id":"s1","backgroundColor":"#FFFFFF","elements":[]}]'
    }, headers=headers)
    assert create_res.status_code == 201
    deck = create_res.json()
    assert deck["title"] == "Quarterly Product Deck"

    deck_id = deck["id"]
    list_res = await client.get("/api/v1/presentations/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


@pytest.mark.asyncio
async def test_daily_task_log_flow(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "dailylog@nexus.workspace",
        "password": "SecurePassword123!",
        "full_name": "Daily Log User"
    })
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "dailylog@nexus.workspace",
        "password": "SecurePassword123!"
    })
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    ws_res = await client.get("/api/v1/workspaces/", headers=headers)
    headers["X-Workspace-Id"] = ws_res.json()[0]["id"]

    upsert_res = await client.post("/api/v1/tasks/daily-logs/upsert", json={
        "log_date": "2026-09-19",
        "log_date_formatted": "Sabtu, 19 September 2026",
        "tasks_done_json": '[{"id":"1","title":"JWT Auth"}]',
        "tasks_in_progress_json": '[{"id":"2","title":"Kanban Board"}]',
        "reflection_note": "Evaluasi harian selesai."
    }, headers=headers)
    assert upsert_res.status_code == 200
    log_data = upsert_res.json()
    assert log_data["log_date"] == "2026-09-19"
    assert "Evaluasi harian" in log_data["reflection_note"]

    list_logs = await client.get("/api/v1/tasks/daily-logs/all", headers=headers)
    assert list_logs.status_code == 200
    assert len(list_logs.json()) == 1


@pytest.mark.asyncio
async def test_bg_remover_history_flow(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "bgremover@nexus.workspace",
        "password": "SecurePassword123!",
        "full_name": "BG User"
    })
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "bgremover@nexus.workspace",
        "password": "SecurePassword123!"
    })
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    ws_res = await client.get("/api/v1/workspaces/", headers=headers)
    headers["X-Workspace-Id"] = ws_res.json()[0]["id"]

    save_res = await client.post("/api/v1/it-tools/bg-remover/history", json={
        "title": "Model Portrait BG Removed",
        "original_url": "data:image/png;base64,orig...",
        "processed_url": "data:image/png;base64,proc...",
        "bg_type": "transparent"
    }, headers=headers)
    assert save_res.status_code == 200
    item = save_res.json()
    assert item["title"] == "Model Portrait BG Removed"
    assert item["bg_type"] == "transparent"

    history_res = await client.get("/api/v1/it-tools/bg-remover/history", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) == 1




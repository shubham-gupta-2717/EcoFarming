# Firestore Index Setup Guide

## Required Composite Index for Mission Creation

To enable full mission history tracking, you need to create a composite index in Firestore.

## Option 1: Automatic Creation (Easiest)

1. **Try to create a mission** in the app
2. When the error appears, **click the link** in the error message
3. It will open Firebase Console with the index pre-configured
4. Click **"Create Index"**
5. Wait 2-5 minutes for the index to build

## Option 2: Manual Creation via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ecofarming-2319f**
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **"Create Index"**
5. Configure as follows:
   - **Collection ID**: `user_missions`
   - **Fields to index**:
     - Field: `userId`, Order: **Ascending**
     - Field: `crop`, Order: **Ascending**
     - Field: `createdAt`, Order: **Descending**
   - **Query scope**: Collection
6. Click **"Create"**
7. Wait for the index to build (usually 2-5 minutes)

## Option 3: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# From the project root
firebase deploy --only firestore:indexes
```

This will deploy the index configuration from `firestore.indexes.json`.

## Verification

Once the index is created:
1. Go to Firebase Console → Firestore Database → Indexes
2. You should see the index with status **"Enabled"** (green)
3. Try creating a mission again - it should work without errors!

## What This Index Does

This composite index allows the app to:
- Query missions by user AND crop together
- Sort by creation date
- Provide AI with context about previous missions to avoid repetition
- Improve mission variety and relevance

## Note

The app will still work without this index (missions will be created), but the AI won't have context about your previous missions, which may result in some repetitive suggestions.

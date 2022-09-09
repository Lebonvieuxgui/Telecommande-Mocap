/* This is the C++ header file of the class "MyTakeRecorderController" 
 * which needs to be added to your Unreal Project. 
 */

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Recorder/TakeRecorderPanel.h"
#include "Recorder/TakeRecorderBlueprintLibrary.h"
#include "TakeMetaData.h"
#include "LevelSequence.h"
#include "MyTakeRecorderController.generated.h"

UCLASS()
class FACEARSAMPLE_API AMyTakeRecorderController : public AActor
{
	GENERATED_BODY()

public:
	// Sets default values for this actor's properties
	AMyTakeRecorderController();

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

public:
	// Called every frame
	virtual void Tick(float DeltaTime) override;

	UFUNCTION(BlueprintCallable, Category = "Default")
		void StartRecording(FString InSlate);

	UFUNCTION(BlueprintCallable, Category = "Default")
		void StopRecording();

	UFUNCTION(BlueprintCallable, Category = "Default")
		bool IsRecording();

	UFUNCTION(BlueprintCallable, Category = "Default")
		void SetSlate(FString InSlate, UTakeRecorderPanel* Panel);
};

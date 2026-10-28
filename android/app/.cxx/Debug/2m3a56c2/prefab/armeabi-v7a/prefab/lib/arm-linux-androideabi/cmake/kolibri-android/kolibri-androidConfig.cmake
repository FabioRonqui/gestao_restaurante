if(NOT TARGET kolibri-android::kolibri)
add_library(kolibri-android::kolibri STATIC IMPORTED)
set_target_properties(kolibri-android::kolibri PROPERTIES
    IMPORTED_LOCATION "C:/Users/Jesus/.gradle/caches/9.4.1/transforms/8ecdea8e879178aa1e721829f4e819fb/transformed/kolibri-android-0.2.3/prefab/modules/kolibri/libs/android.armeabi-v7a/libkolibri.a"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Jesus/.gradle/caches/9.4.1/transforms/8ecdea8e879178aa1e721829f4e819fb/transformed/kolibri-android-0.2.3/prefab/modules/kolibri/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

